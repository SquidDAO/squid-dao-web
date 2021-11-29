import React from "react";
import styled from "styled-components";
import { formatEth, trim } from "../../helpers";

const Liquidity: React.FC<{ treasuryLPBalance: number; ratio: number }> = ({ treasuryLPBalance, ratio }) => {
  return (
    <Wrapper>
      <Title>Liquidity Accumulation</Title>
      <div className="row g-4 d-flex flex-wrap justify-content-between" style={{ margin: "0 -1rem 2rem -1rem" }}>
        <div className="col flex-grow-1" style={{ padding: "0 1rem" }}>
          <Stats title="Protocol Owned Liquidity Value" value={formatEth(treasuryLPBalance)} />
        </div>
        <div className="col flex-grow-1" style={{ padding: "0 1rem" }}>
          <Stats title="Protocol Owned Liquidity Percentage" value={trim(ratio, 2) + "%"} />
        </div>
      </div>
      <P>
        The Squid DAO treasury owns almost all of the liquidity of its token. This grants two major benefits to the DAO.
      </P>
      <P>Firstly, it grows the treasury value via the trading fees collected.</P>
      <P>
        Secondly, it allow for user security as there will always be ever deepening trading liquidity for those that
        wish to increase or reduce their holdings.
      </P>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border-radius: 10px;
  background-color: #f2f4f7;
  padding: 2.5rem 3.5rem;
`;

const Title = styled.h2.attrs({
  className: "text-center",
})`
  margin-bottom: 32px;
`;

const P = styled.p`
  text-align: center;
  font-size: 1rem;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
`;

const Stats: React.FC<{ title: string; value: string }> = ({ title, value }) => {
  return (
    <StatsWrapper className="d-flex flex-column align-items-center h-100">
      <StatsTitle>{title}</StatsTitle>
      <StatsValue>{value}</StatsValue>
    </StatsWrapper>
  );
};

const StatsWrapper = styled.div`
  border-radius: 10px;
  padding: 1.5rem;
  background-color: white;
`;

const StatsTitle = styled.div`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  flex-grow: 1;
`;

const StatsValue = styled.div`
  line-height: 3rem;
  font-size: 2rem;
  color: #7f7fd5;
  font-weight: 600;
  white-space: nowrap;
`;

export default Liquidity;
