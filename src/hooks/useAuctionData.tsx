import { BigNumber } from "ethers";
import { useAuctionContext, AuctionData } from "./auctionContext";

const useAuctionData = (auctionId: number): AuctionData => {
  const { lastAuction, pastAuctions } = useAuctionContext();

  if (!lastAuction) {
    return {
      auctionId: 0,
      imgUrl: "",
      bidder: "",
      amount: BigNumber.from(0),
      startTime: new Date(0),
      endTime: new Date(0),
      settled: false,
      bids: [],
    };
  }
  if (lastAuction.auctionId === auctionId) {
    return lastAuction;
  } else {
    const auction = pastAuctions.find(a => a.auctionId === auctionId);
    if (auction) {
      return auction;
    } else {
      return {
        auctionId: 0,
        imgUrl: "",
        bidder: "",
        amount: BigNumber.from(0),
        startTime: new Date(0),
        endTime: new Date(0),
        settled: false,
        bids: [],
      };
    }
  }
};

export default useAuctionData;
