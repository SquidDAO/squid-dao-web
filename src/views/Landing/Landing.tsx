import React, { useEffect, useState } from "react";
import { AppBar, Button, Link, SvgIcon, Toolbar, Typography } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import FAQ from "./FAQ";
import Auction from "./Auction";
import { Modal, ModalProvider } from "./Modal";
import Showcase from "./Showcase";
import { dark as theme } from "./theme";
import { useAddress, useWeb3Context } from "../../../src/hooks/web3Context";
import { useAuctionContext } from "../../hooks/auctionContext";
import { shorten } from "../../helpers";
import logo from "../../assets/SquidDaoLogo.svg";

import "../../style.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const useStyles = makeStyles(theme => ({
  appBar: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    background: "transparent",
    backdropFilter: "none",
    zIndex: 10,
    padding: "30px 0",
  },
}));

const Landing: React.FC = () => {
  const classes = useStyles();
  const { connect, disconnect, hasCachedProvider } = useWeb3Context();
  const { lastAuctionId, paused } = useAuctionContext();

  const { id } = useParams() as { id: string | undefined };
  const initialAuctionId = !isNaN(Number(id)) ? Number(id) : undefined;

  const address = useAddress();

  const [auctionId, setAuctionId] = useState<number | undefined>(undefined);

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
    if (hasCachedProvider()) {
      connect();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ModalProvider>
        <CssBaseline />
        <Wrapper>
          <Blur1 />
          <Blur2 />
          <Modal />
          <AppBar position="static" className={classes.appBar} elevation={0}>
            <Toolbar style={{ width: "100%", justifyContent: "space-between" }}>
              <Logo src={logo} alt="SquidDaoLogo" />
              <div className="d-flex align-items-center">
                <Link variant="h5" href="/stake">
                  Stake
                </Link>
                <Link variant="h5" href="https://squid-dao.gitbook.io/squiddao/" style={{ padding: "0 14px" }}>
                  Docs
                </Link>
                {address ? (
                  <Button variant="outlined" color="primary">
                    {shorten(address)}
                  </Button>
                ) : (
                  <Button variant="outlined" color="primary" onClick={() => connect()}>
                    {"Connect Wallet"}
                  </Button>
                )}
              </div>
            </Toolbar>
          </AppBar>
          <Container fluid="lg" style={{ position: "relative" }}>
            {auctionId !== undefined && !paused && <Auction auctionId={auctionId} />}
            <Showcase />
          </Container>
        </Wrapper>
      </ModalProvider>
    </ThemeProvider>
  );
};

const Wrapper = styled.div`
  background-color: #200a2b;
  height: 100vh;
  overflow: scroll;
  font-family: system, -apple-system, San Francisco, Segoe UI, Segoe, Segoe WP, Helvetica Neue, helvetica, Lucida Grande,
    arial, sans-serif !important;
`;

const Blur1 = styled.img`
  position: fixed;
  top: -600px;
  left: -600px;
  width: 1200px;
  height: 1200px;
  background: linear-gradient(136.32deg, rgba(225, 37, 85, 0) 16.32%, rgba(255, 80, 206, 0.75) 85.53%);
  filter: blur(470.273px);
`;

const Logo = styled.img`
  width: 110px;

  @media (min-width: 768px) {
    width: auto;
  }
`;

const Blur2 = styled.img`
  position: fixed;
  bottom: -200px;
  right: -200px;
  width: 788px;
  height: 733px;
  background: linear-gradient(142.97deg, rgba(225, 37, 85, 0.95) 17.43%, rgba(255, 84, 156, 0.22) 73.23%);
  filter: blur(365.822px);
`;

const CurrentBid: React.FC = () => {
  return (
    <div>
      <Typography variant="h6" component="div">
        Current Bid
      </Typography>
      <Typography variant="h2" component="div">
        7.00 ETH
      </Typography>
      <Typography variant="h6" component="div">
        $24,143.53
      </Typography>
      <Typography variant="h6" component="div">
        Minimum bid: 102.74 ETH
      </Typography>
    </div>
  );
};

export default Landing;
