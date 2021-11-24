import React from "react";
import styled from "styled-components";

const BuySquid: React.FC = () => {
  return (
    <Wrapper className="d-flex align-items-center">
      <img />
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-between">
          <div>SQUID TOKEN</div>
          <div>BUY</div>
        </div>
        <div>
          The $SQUID token is a rebasing currency that is backed by Ethereum. Simply by staking this token, holdings
          grow at a exceptional rate.
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border-radius: 10px;
  padding: 30px 40px;
  background-color: #f2f4f7;
  margin: 4rem 0;
`;

export default BuySquid;
