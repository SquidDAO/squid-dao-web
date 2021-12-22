import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useAuctionContext } from "../../hooks/auctionContext";
import Bid from "./Bid";
import BuySquid from "./BuySquid";
import Liquidity from "./Liquidity";
import Splash from "./Splash";
import Stats from "./Stats";
import { allBondsMap, squid_weth } from "../../helpers/AllBonds";
import apollo from "../../lib/apolloClient";
import { treasuryDataQuery } from "../TreasuryDashboard/treasuryData.js";
import { Modal, ModalProvider } from "./Modal";

import nft01 from "../../assets/images/nft_01.png";
import nft02 from "../../assets/images/nft_02.png";
import nft03 from "../../assets/images/nft_03.png";
import nft04 from "../../assets/images/nft_04.png";
import ethereumIcon from "../../assets/icons/ethereum.svg";
import squidIcon from "../../assets/icons/logo.svg";
import coinIcon from "../../assets/icons/coin.svg";

interface IStateView {
  app: {
    stakingAPY: number;
    [key: string]: any;
  };
  bonding: {
    loading: Boolean;
    [key: string]: any;
  };
}

interface IData {
  totalValueLocked: number;
  treasurySquidEthPOL: number;
}

const Auction: React.FC = () => {
  const { id } = useParams() as { id: string | undefined };
  const initialAuctionId = !isNaN(Number(id)) ? Number(id) : undefined;

  const { lastAuctionId, paused } = useAuctionContext();
  const [auctionId, setAuctionId] = useState<number | undefined>(undefined);
  const [data, setData] = useState<IData[] | undefined>(undefined);

  const treasuryBalance = useSelector((state: IStateView) => {
    if (state.bonding.loading === false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (allBondsMap[bond].active && state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances;
    }
    return 0;
  });

  const treasuryLPBalance = useSelector((state: IStateView) => {
    if (state.bonding.loading === false && state.bonding[squid_weth.name]) {
      return state.bonding[squid_weth.name].purchased;
    }
    return 0;
  });

  const stakingAPY = useSelector((state: IStateView) => {
    return state.app.stakingAPY;
  });

  useEffect(() => {
    if (lastAuctionId === undefined) return;

    if (initialAuctionId !== undefined) {
      if (initialAuctionId > lastAuctionId || initialAuctionId < 0) {
        setAuctionId(lastAuctionId);
      } else {
        setAuctionId(initialAuctionId);
      }
    } else {
      setAuctionId(lastAuctionId);
    }
  }, [initialAuctionId, lastAuctionId]);

  useEffect(() => {
    apollo(treasuryDataQuery).then((r: any) => {
      let metrics = r.data.protocolMetrics.map((entry: any) =>
        Object.entries(entry).reduce((obj: any, [key, value]: [any, any]) => ((obj[key] = parseFloat(value)), obj), {}),
      );
      metrics = metrics.filter((pm: any) => pm.treasuryMarketValue > 0);
      setData(metrics);
    });
  }, []);

  let tvl: number = 0;
  let ratio: number = 0;
  if (data) {
    tvl = data[0].totalValueLocked;
    ratio = data[0].treasurySquidEthPOL;
  }

  return (
    <ModalProvider>
      <Modal />
      <Wrapper className="d-flex flex-column m-auto">
        <Splash />
        {auctionId !== undefined && !paused && <Bid auctionId={auctionId} />}
        <Section>
          <SectionTitle>What is the SQUID DAO?</SectionTitle>
          <Text1 className="text-center">
            On October 20, 2021, an anonymous group of DeFi veterans came together to launch Squid DAO. These anons
            believed they could leverage the economic successes popularized by the Olympus and the fundraising
            mechanisms introduced by Nouns DAOs to create an economic flywheel backed by ETH.
            <br />
            Thus, the SQUID was born.
          </Text1>
          {/*<BuySquid />*/}
          <Stats treasuryBalance={treasuryBalance} stakingAPY={stakingAPY} tvl={tvl} />
        </Section>
        <Section>
          <SectionTitle>How does it work?</SectionTitle>
          <Text2 className="text-center">
            The SQUID DAO takes ETH into its treasury via two main mechanisms:
            <br />
            the NFT Auctions and Spawning
          </Text2>
          <div className="d-flex justify-content-center align-items-center" style={{ marginBottom: "1.5rem" }}>
            <NFT1 src={nft02} />
            <NFT2 src={nft03} />
            <NFT3 src={nft04} />
          </div>
          <Text2 className="text-center">
            Excess ETH, beyond the 1-1 backing,
            <br />
            is used to mint additional SQUID which is given to the hibernators.
          </Text2>
          <InfoGroup />
        </Section>
        <Section>
          <SectionTitle>Is the NFT just an amazing profile picture?</SectionTitle>
          <div className="d-flex justify-content-center" style={{ margin: "0 2.5rem 4rem 2.5rem", flexWrap: "wrap" }}>
            <NftBottom src={nft01} />
            <div
              className="d-flex flex-column justify-content-between"
              style={{ padding: "0.5rem 1rem", minWidth: "22.5rem", maxWidth: "32rem", flex: "1 0" }}
            >
              <List index={1}>Acts as a claim on the fees generated by the protocol</List>
              <List index={2}>Grants voting power over the direction of the dao</List>
              <List index={3}>
                Provides exclusive access to hidden chats and networks throughout the Squid DAO ecosystem
              </List>
            </div>
          </div>
          <Liquidity treasuryLPBalance={treasuryLPBalance} ratio={ratio} />
        </Section>
      </Wrapper>
    </ModalProvider>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 984px;
`;

const Section = styled.section`
  border-bottom: 1px solid #bfcad9;
  padding: 64px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h1.attrs({
  className: "text-center",
})`
  margin-bottom: 32px;
`;

const Text1 = styled.p`
  font-size: 1rem;
  line-height: 1.8rem;
`;

const Text2 = styled.p`
  font-size: 1rem;
  line-height: 1.5rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const NFT = styled.img`
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
`;

const NFT1 = styled(NFT)`
  max-width: 220px;
  width: 30%;
  margin-right: -1.5%;
`;

const NFT2 = styled(NFT)`
  max-width: 260px;
  width: 35%;
  z-index: 1;
`;

const NFT3 = styled(NFT)`
  max-width: 220px;
  width: 30%;
  margin-left: -1.5%;
`;

const NftBottom = styled(NFT)`
  width: 400px;
  max-width: 400px;
  height: 400px;
  max-height: 400px;
`;

const List: React.FC<{ index: number }> = ({ index, children }) => {
  return (
    <div className="d-flex align-items-center" style={{ padding: "0.5rem 0" }}>
      <ListNumber className="d-flex justify-content-center align-items-center flex-shrink-0">{index}</ListNumber>
      <ListText>{children}</ListText>
    </div>
  );
};

const ListNumber = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  color: #7f7fd5;
  font-size: 1.5rem;
  font-weight: 700;
  margin-right: 1.5rem;
`;

const ListText = styled.div`
  text-transform: uppercase;
  font-weight: 600;
  line-height: 1.5rem;
  font-size: 1rem;
`;

const InfoGroup: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="row g-4">
        <div className="col">
          <Info img={ethereumIcon}>ETH in the treasury is Deployed to defi to generate yield</Info>
        </div>
        <div className="col">
          <Info img={squidIcon}>This yield allows for more SQUID to be minted for hibernators</Info>
        </div>
        <div className="col">
          <Info img={coinIcon}>Fees generated by the protocol are also shared with long-term hibernators</Info>
        </div>
      </div>
    </div>
  );
};

const Info: React.FC<{ img: string }> = ({ img, children }) => {
  return (
    <InfoWrapper>
      <img src={img} style={{ width: "88px", height: "88px" }} />
      <InfoDivider />
      <InfoText>{children}</InfoText>
    </InfoWrapper>
  );
};

const InfoWrapper = styled.div.attrs({
  className: "d-flex flex-column align-items-center",
})`
  border-radius: 10px;
  background-color: #f2f4f7;
  padding: 2rem;
  height: 100%;
`;

const InfoDivider = styled.div`
  width: 2.5rem;
  height: 0.25rem;
  margin: 1.5rem 0;
  background-color: #7f7fd5;
  border-radius: 8px;
`;

const InfoText = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  text-align: center;
  text-transform: uppercase;
`;

export default Auction;
