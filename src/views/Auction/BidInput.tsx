import BN from "bignumber.js";
import { BigNumber, Contract, ethers, utils } from "ethers";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button as MuiButton, FormControl, InputGroup, Spinner } from "react-bootstrap";
import styled from "styled-components";
import { abi as auctionAbi } from "../../abi/SquidAuction.json";
import { addresses } from "../../constants";
import { useWeb3Context } from "../../hooks";
import { AuctionData } from "../../hooks/auctionContext";
import { useModalContext } from "./Modal";

const useMinBidIncrementPercentage = () => {
  const [minBidIncPct, setMinBidIncPct] = useState(new BN(0));

  const { provider, chainID } = useWeb3Context();
  useEffect(() => {
    const auctionContract = new Contract(addresses[chainID].AUCTION_ADDRESS, auctionAbi, provider);
    auctionContract.callStatic.minBidIncrementPercentage().then(pct => {
      setMinBidIncPct(new BN(pct.toString()));
    });
  }, [chainID, provider]);

  return minBidIncPct;
};

const useAuctionContract = () => {
  const { provider, chainID } = useWeb3Context();
  return new ethers.Contract(addresses[chainID].AUCTION_ADDRESS, auctionAbi, provider.getSigner());
};

interface BidProps {
  auction: AuctionData;
}

const minBidEth = (currentBid: BN, minBidIncPct: BN): string => {
  if (currentBid.isZero()) {
    return "1";
  }

  const minBidInWei = currentBid.times(minBidIncPct.div(100).plus(1));
  const eth = Number(utils.formatEther(BigNumber.from(minBidInWei.toString())));
  const roundedEth = Math.ceil(eth * 100) / 100;

  return roundedEth.toString();
};

const BidInput: React.FC<BidProps> = ({ auction }) => {
  const isAuctionEnd = auction.endTime.getTime() < new Date().getTime();
  const auctionContract = useAuctionContract();

  const { connected } = useWeb3Context();
  const { onPresent } = useModalContext();

  const [buttonState, setButtonState] = useState({
    loading: false,
    content: isAuctionEnd ? "Settle Auction" : "Bid",
  });

  const [bidAmount, setBidAmount] = useState("");

  const minBidIncPct = useMinBidIncrementPercentage();
  const minBid = minBidEth(new BN(auction.amount.toString()), minBidIncPct);

  const [placeBidState, setPlaceBidState] = useState({
    status: "None",
    errorMessage: "",
  });

  const [settleState, setSettleState] = useState({
    status: "None",
    errorMessage: "",
  });

  const buttonReady = useMemo(() => {
    if (!connected) {
      return false;
    } else if (!isAuctionEnd && bidAmount !== "") {
      return Number(bidAmount) >= Number(minBid);
    } else {
      return true;
    }
  }, [bidAmount, isAuctionEnd, minBid, connected]);

  const bidAmountHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    // disable more than 2 digits after decimal point
    if (input.includes(".") && event.target.value.split(".")[1].length > 2) {
      return;
    }

    setBidAmount(event.target.value);
  };

  const placeBidHandler = useCallback(async () => {
    if (!bidAmount) return;

    const value = utils.parseEther(bidAmount);
    try {
      const gasLimit = await auctionContract.estimateGas.createBid(auction.auctionId, {
        value,
      });
      const response = await auctionContract.createBid(auction.auctionId, {
        value,
        gasLimit: gasLimit.add(10_000), // A 10,000 gas pad is used to avoid 'Out of gas' errors
      });
      setPlaceBidState({ status: "Mining", errorMessage: "" });
      setButtonState({ loading: true, content: "" });
      await response.wait();
      setPlaceBidState({ status: "Success", errorMessage: "" });
      onPresent("Success", "Bid was placed.");
      setButtonState({ loading: false, content: "Bid" });
      setBidAmount("");
    } catch (e) {
      setPlaceBidState({ status: "Fail", errorMessage: "" });
      onPresent("Transaction Failed", placeBidState.errorMessage ? placeBidState.errorMessage : "Please try again.");
      setButtonState({ loading: false, content: "Bid" });
    }
    setButtonState({ loading: false, content: "Bid" });
  }, [auction.auctionId, auctionContract, bidAmount, onPresent, placeBidState.errorMessage]);

  const settleAuctionHandler = async () => {
    try {
      const response = await auctionContract.settleCurrentAndCreateNewAuction();
      setSettleState({ status: "Mining", errorMessage: "" });
      setButtonState({ loading: true, content: "" });
      await response.wait();
      setSettleState({ status: "Success", errorMessage: "" });
      onPresent("Success", `Settled auction successfully!`);
      setButtonState({ loading: false, content: "Settle Auction" });
    } catch (e) {
      setSettleState({ status: "Fail", errorMessage: "" });
      onPresent("Transaction Failed", settleState.errorMessage ? settleState.errorMessage : "Please try again.");
      setButtonState({ loading: false, content: "Settle Auction" });
    }
    setButtonState({ loading: false, content: "Settle Auction" });
  };

  return (
    <>
      <div className="d-flex">
        {isAuctionEnd ? (
          <AuctionEndedButton onClick={settleAuctionHandler} disabled={!buttonReady}>
            {buttonState.loading ? <Spinner animation="border" /> : buttonState.content}
          </AuctionEndedButton>
        ) : (
          <>
            <div className="position-relative flex-grow-1 d-flex align-items-center">
              <Input type="number" min="0" onChange={bidAmountHandler} value={bidAmount} />
              <Placeholder>ETH</Placeholder>
            </div>
            <BidButton onClick={placeBidHandler} disabled={!buttonReady}>
              {buttonState.loading ? <Spinner animation="border" /> : buttonState.content}
            </BidButton>
          </>
        )}
      </div>
      {!isAuctionEnd && (
        <Note>
          Minimum bid: {minBid} ETH
          <br />
          NFT Winner will receive 0 $SQUID. Each NFT will grant you 1 SQUID DAO vote.
        </Note>
      )}
    </>
  );
};

const Input = styled(FormControl)`
  height: 3rem;
  color: black;
  border: 1px solid #aaa !important;
  border-radius: 40px !important;
  background-color: white;
  font-weight: bold;
  outline: none !important;
  box-shadow: none !important;
  padding-left: 20px;

  &:hover,
  &:focus,
  &:active,
  &:disabled {
    border: 1px solid #aaa !important;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Placeholder = styled.span`
  position: absolute;
  right: 1.5rem;
  font-weight: bold;
  color: #aaa;
  z-index: 3;
  font-size: 1rem;
`;

const Button = styled(MuiButton)`
  height: 3rem;
  color: white;
  border: transparent;
  background-color: #7f7fd5;
  padding: 0.625rem 1.25rem;
  border-radius: 40px;
  font-weight: bold;

  &:hover,
  &:active,
  &:focus {
    background-color: #4b4bb5 !important;
  }

  &:disabled {
    background-color: #c1c3cb !important;
    color: #8f8f8f;
    outline: none !important;
    box-shadow: none !important;
  }
`;

const AuctionEndedButton = styled(Button)`
  width: 100%;
`;

const BidButton = styled(Button)`
  margin-left: 1rem;
`;

const Note = styled.div`
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 1rem;
`;

export default BidInput;
