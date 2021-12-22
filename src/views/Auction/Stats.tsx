import React from "react";
import styled from "styled-components";
import { formatEth, trim } from "../../helpers";

const Stats: React.FC<{ treasuryBalance: number; stakingAPY: number; tvl: number }> = ({
  treasuryBalance,
  stakingAPY,
  tvl,
}) => {
  return (
    <div className="row g-4 d-flex justify-content-around">
      <Stat title="Treasury Balance" value={formatEth(treasuryBalance)} />
      <Stat title="Current APY" value={new Intl.NumberFormat("en-US").format(trim(stakingAPY * 100, 1)) + "%"} />
      <Stat title="Total Value Deposited" value={formatEth(tvl)} />
    </div>
  );
};

interface StatProps {
  title: string;
  value: string;
}

const Stat: React.FC<StatProps> = ({ title, value }) => {
  return (
    <div className="col text-center" style={{ fontWeight: 600, minWidth: "16rem" }}>
      <Value>{value}</Value>
      <Title>{title}</Title>
    </div>
  );
};

const Value = styled.div`
  font-size: 2rem;
  line-height: 3rem;
  color: #7f7fd5;
  margin-bottom: 0.5rem;
  white-space: nowrap;
`;

const Title = styled.div`
  font-size: 1rem;
`;

export default Stats;
