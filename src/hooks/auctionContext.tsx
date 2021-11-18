import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { addresses, SQUID_NFT_GRAPH_URLS } from "../constants";
import { useWeb3Context } from "./web3Context";
import { pastAuctionsQuery } from "../helpers/subgraph";
import { apolloExt } from "../lib/apolloClient";
import { abi as auctionAbi } from "../abi/SquidAuction.json";

export type BidData = {
  bidder: string;
  bidAmount: BigNumber;
  txHash: string;
  bidTime: Date;
  blockNumber: number;
};

export type AuctionData = {
  auctionId: number;
  imgUrl: string;
  amount: BigNumber;
  startTime: Date;
  endTime: Date;
  bidder: string;
  settled: boolean;
  bids: BidData[];
};

export type AuctionContextType = {
  lastAuctionId: number | undefined;
  lastAuction: AuctionData | undefined;
  pastAuctions: AuctionData[];
  paused: boolean;
};

const AuctionContext = React.createContext<AuctionContextType>({
  lastAuctionId: undefined,
  lastAuction: undefined,
  pastAuctions: [],
  paused: true,
});

const BLOCKS_PER_DAY = 6_500;

export const AuctionContextProvider: React.FC = ({ children }) => {
  const { wsProvider, chainID } = useWeb3Context();

  const [lastAuctionId, setLastAuctionId] = useState<number | undefined>(undefined);
  const [lastAuction, setLastAuction] = useState<AuctionData | undefined>(undefined);
  const [pastAuctions, setPastAuctions] = useState<AuctionData[]>([]);
  const [paused, setPaused] = useState<boolean>(true);

  const fetchAuctions = useCallback(async () => {
    const auctionContract = new ethers.Contract(addresses[chainID].AUCTION_ADDRESS as string, auctionAbi, wsProvider);
    const bidFilter = auctionContract.filters.AuctionBid(null, null, null, null);

    const currentAuction = await auctionContract.auction();
    const paused = await auctionContract.paused();
    const currentAuctionId = currentAuction.squidDAONFTId.toNumber();

    setPaused(paused);

    const auction: AuctionData = {
      auctionId: currentAuctionId,
      amount: currentAuction.amount,
      startTime: new Date(currentAuction.startTime.toNumber() * 1000),
      endTime: new Date(currentAuction.endTime.toNumber() * 1000),
      bidder: currentAuction.bidder,
      settled: currentAuction.settled,
      imgUrl: "", // TODO
      bids: [],
    };

    // Fetch the previous 24 hours of bids
    const previousBids = await auctionContract.queryFilter(bidFilter, 0 - BLOCKS_PER_DAY);
    for (let event of previousBids) {
      if (event.args && event.args.squidDAONFTId.eq(currentAuction.squidDAONFTId)) {
        const timestamp = (await event.getBlock()).timestamp;
        auction.bids.push({
          txHash: event.transactionHash,
          bidAmount: event.args.value,
          bidder: event.args.sender,
          blockNumber: event.blockNumber,
          bidTime: new Date(timestamp * 1000),
        });
      }
    }

    setLastAuctionId(currentAuctionId);
    setLastAuction(auction);

    // Fetch past auctions.
    const data = await apolloExt(pastAuctionsQuery(currentAuctionId), SQUID_NFT_GRAPH_URLS[chainID]);
    if (data) {
      const auctions: AuctionData[] = [];
      for (let a of data.data.auctions) {
        const bids: BidData[] = [];
        for (let b of a.bids) {
          bids.push({
            bidder: b.bidder.id,
            bidAmount: BigNumber.from(b.amount),
            txHash: b.id,
            bidTime: new Date(Number(b.blockTimestamp) * 1000),
            blockNumber: Number(b.blockNumber),
          });
        }
        auctions.push({
          auctionId: Number(a.id),
          amount: BigNumber.from(a.amount),
          startTime: new Date(Number(a.startTime) * 1000),
          endTime: new Date(Number(a.endTime) * 1000),
          bidder: a.bidder ? a.bidder.id : "",
          settled: a.settled,
          imgUrl: "", // TODO
          bids: bids,
        });
      }
      setPastAuctions(auctions);
    }
  }, [chainID, wsProvider]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  useEffect(() => {
    const auctionContract = new ethers.Contract(addresses[chainID].AUCTION_ADDRESS as string, auctionAbi, wsProvider);
    const bidFilter = auctionContract.filters.AuctionBid(null, null, null, null);
    const createdFilter = auctionContract.filters.AuctionCreated(null, null, null);
    const settledFilter = auctionContract.filters.AuctionSettled(null, null, null);
    const extendedFilter = auctionContract.filters.AuctionExtended(null, null);

    const auction = lastAuction;
    if (!auction) {
      return;
    }

    // Listen a new bid event.
    auctionContract.on(bidFilter, async (squidDAONFTId, sender, value, extended, event) => {
      const timestamp = (await event.getBlock()).timestamp;
      auction.bidder = sender;
      auction.amount = value;
      auction.bids.push({
        txHash: event.transactionHash,
        bidAmount: event.args.value,
        bidder: event.args.sender,
        blockNumber: event.blockNumber,
        bidTime: new Date(timestamp * 1000),
      });
      setLastAuction({
        ...auction,
        bids: auction.bids,
      });
    });

    // Listen a new auction event.
    auctionContract.on(createdFilter, async (squidDAONFTId, startTime, endTime, event) => {
      fetchAuctions();
    });

    // Listen an auction settled event.
    auctionContract.on(settledFilter, async (squidDAONFTId, winner, amount, event) => {
      fetchAuctions();
    });

    // Listen an auction extended event.
    auctionContract.on(extendedFilter, async (squidDAONFTId, endTime, event) => {
      auction.endTime = new Date(Number(endTime) * 1000);
      setLastAuction({
        ...auction,
      });
    });

    return () => {
      auctionContract.removeAllListeners();
    };
  }, [chainID, fetchAuctions, lastAuction, wsProvider]);

  const auctionContext = useMemo<AuctionContextType>(() => {
    return {
      lastAuctionId,
      lastAuction,
      pastAuctions,
      paused,
    };
  }, [lastAuctionId, lastAuction, pastAuctions, paused]);
  return <AuctionContext.Provider value={auctionContext}>{children}</AuctionContext.Provider>;
};

export const useAuctionContext = () => {
  const auctionContext = useContext(AuctionContext);
  return auctionContext;
};
