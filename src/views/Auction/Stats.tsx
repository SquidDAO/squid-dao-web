import React from "react";
import styled from "styled-components";

const Stats: React.FC = () => {
  return (
    <div className="d-flex justify-content-around">
      <Stat title="Treasury Balance" value="$838,392,324" />
      <Stat title="Current APY" value="43.50%" />
      <Stat title="Total Value Locked" value="$99,212" />
    </div>
  );
};

interface StatProps {
  title: string;
  value: string;
}

const Stat: React.FC<StatProps> = ({ title, value }) => {
  return (
    <div className="text-center" style={{ fontWeight: 600 }}>
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
`;

const Title = styled.div`
  font-size: 1rem;
`;

export default Stats;
