import { Typography } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, FormControl, InputGroup, Row, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { useWeb3Context } from "../../hooks";
import { useAuctionContext, BidData } from "../../hooks/auctionContext";
import useAuctionData from "../../hooks/useAuctionData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { shorten, formatEther } from "../../helpers";
import { useReverseENSLookUp } from "../../helpers/ensLookup";
import useAuctionImage from "../../helpers/useAuctionImages";
import Bid from "./Bid";
import { useModalContext } from "./Modal";

interface AuctionProps {
  auctionId: number;
}

const Auction: React.FC<AuctionProps> = ({ auctionId }) => {
  const history = useHistory();

  const onNextAuction = () => history.push(`/squid/${auctionId + 1}`);
  const onPrevAuction = () => history.push(`/squid/${auctionId - 1}`);

  const { lastAuctionId } = useAuctionContext();
  const auctionData = useAuctionData(auctionId);

  const auction = useAuctionData(auctionId);
  const amount = formatEther(auction.amount);

  const { onPresent } = useModalContext();
  const historyBids = useMemo(
    () => (
      <>
        {auction.bids
          .sort((a, b) => {
            return b.bidTime.getTime() - a.bidTime.getTime();
          })
          .map((bid, idx) => (
            <BidRecord key={idx} bid={bid} />
          ))}
      </>
    ),
    [auction],
  );

  return (
    <Row className="gy-4">
      <Col lg={6} className="d-flex flex-column align-items-center">
        <Art src={useAuctionImage(auctionId)} />
        <ArtNav
          isFirst={auctionId === 0}
          isLast={auctionId === lastAuctionId}
          onPrevAuctionClick={onPrevAuction}
          onNextAuctionClick={onNextAuction}
        />
      </Col>
      <Col lg={6} className="d-flex flex-column">
        <Row className="mb-3">
          <Col>
            <Typography variant="h2" component="div">
              Squid {auctionId}
            </Typography>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6} className="mb-2 mb-md-0">
            <CurrentBid bid={amount.toNumber()} />
          </Col>
          <Col md={6}>
            {auction.settled ? <Winner address={auction.bidder} /> : <BidTimer date={auction.endTime} />}
          </Col>
        </Row>
        <Row className="mb-3">{auctionId === lastAuctionId && <Bid auction={auctionData} />}</Row>
        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-column">
              {auction.bids
                .sort((a, b) => {
                  return b.bidTime.getTime() - a.bidTime.getTime();
                })
                .slice(0, 3)
                .map((bid, idx) => (
                  <BidRecord key={idx} bid={bid} />
                ))}
            </div>
          </Col>
        </Row>
        <Row>
          <Col onClick={() => onPresent("History Bids", historyBids)}>
            <Typography variant="h4" component="div" style={{ cursor: "pointer" }}>
              View History
            </Typography>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const CurrentBid: React.FC<{ bid: number }> = ({ bid }) => {
  return (
    <div style={{ borderRight: "1px solid white" }} className="h-100">
      <Typography variant="h6" component="div">
        Current Bid
      </Typography>
      <Typography variant="h2" component="div">
        {bid.toFixed(2)} ETH
      </Typography>
    </div>
  );
};

const BidTimer: React.FC<{ date: Date }> = ({ date }) => {
  const getCountdown = () => {
    const now = Math.floor(new Date().getTime() / 1000);
    const end = Math.floor(date.getTime() / 1000);

    if (now >= end) {
      return [0, 0, 0];
    }

    const d = end - now;
    const hours = Math.floor(d / 3600);
    const minutes = Math.floor((d - hours * 3600) / 60);
    const seconds = d - Math.floor(d / 60) * 60;
    return [hours, minutes, seconds];
  };

  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);
    return () => clearInterval(id);
  }, [getCountdown]);

  return (
    <div>
      <Typography variant="h6" component="div">
        Auction ending in
      </Typography>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Timer t={countdown[0]} unit="Hours" />
        <Timer t={countdown[1]} unit="Minutes" />
        <Timer t={countdown[2]} unit="Seconds" />
      </div>
    </div>
  );
};

const Winner: React.FC<{ address: string }> = ({ address }) => {
  const ens = useReverseENSLookUp(address);
  return (
    <div>
      <Typography variant="h6" component="div">
        Winner
      </Typography>
      <Typography variant="h2" component="div">
        {address ? (ens ? ens : shorten(address)) : "No Winner"}
      </Typography>
    </div>
  );
};

const Timer: React.FC<{ t: number; unit: string }> = ({ t, unit }) => {
  return (
    <div>
      <Typography variant="h2" component="div">
        {t}
      </Typography>
      <Typography variant="h6" component="div">
        {unit}
      </Typography>
    </div>
  );
};

const BidHistory: React.FC = () => {
  return <ul></ul>;
};

const BidRecord: React.FC<{ bid: BidData }> = ({ bid }) => {
  const { chainID } = useWeb3Context();

  const openExplorer = (txHash: string) => {
    const url = chainID === 4 ? "https://rinkeby.etherscan.io/tx/" + txHash : "https://etherscan.io/tx/" + txHash;
    window.open(url);
  };
  const ens = useReverseENSLookUp(bid.bidder);

  return (
    <BidRecordWrapper>
      <Typography variant="h6" component="span">
        {ens ? ens : shorten(bid.bidder)}
      </Typography>
      <Typography variant="h6" component="span" style={{ flexGrow: 1, textAlign: "end" }}>
        Ξ {formatEther(bid.bidAmount).toFixed(4)}
      </Typography>
      <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-3" onClick={() => openExplorer(bid.txHash)} />
    </BidRecordWrapper>
  );
};

interface ArtNavProps {
  isFirst: boolean;
  isLast: boolean;
  onPrevAuctionClick: () => void;
  onNextAuctionClick: () => void;
}

const ArtNav: React.FC<ArtNavProps> = props => {
  const { isFirst, isLast, onPrevAuctionClick, onNextAuctionClick } = props;

  return (
    <div>
      <NavButton onClick={onPrevAuctionClick} disabled={isFirst}>
        ←
      </NavButton>
      <NavButton onClick={onNextAuctionClick} disabled={isLast}>
        →
      </NavButton>
    </div>
  );
};

const NavButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  font-size: xx-large;

  &:disabled {
    opacity: 0.5;
  }
`;

const Art = styled.img`
  width: 100%;
  max-width: 440px;
  //height: 440px;
`;

const BidInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BidRecordWrapper = styled.div`
  height: 44px;
  display: flex;
  background: rgba(32, 10, 43, 0.6);
  margin-top: 8px;
  border-radius: 10px;
  align-items: center;
  padding: 6px 10px;
`;

export default Auction;
