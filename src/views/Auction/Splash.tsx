import React from "react";
import styled from "styled-components";
import splash from "../../assets/splash.png";
import splashLogo from "../../assets/splashLogo.svg";

const Splash: React.FC = () => {
  return (
    <Wrapper>
      <Logo src={splashLogo} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: url("${splash}") center;
  background-size: cover;
  border-radius: 10px;
  min-height: 280px;
  margin-bottom: 3rem;
`;

const Logo = styled.img`
  width: 160px;
`;

export default Splash;
