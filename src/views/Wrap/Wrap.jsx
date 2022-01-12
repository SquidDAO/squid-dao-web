import { Paper, Typography, Box, Tabs, Tab } from "@material-ui/core";
import * as React from "react";
import { useState } from "react";
import "./wrap.scss";

function Wrap() {
  const [wrapState, setWrapState] = useState("wrap");
  const [topRowInfo, setTopRowInfo] = useState({
    sSquidPrice: 0,
    currentIndex: 0,
    wsSquidPrice: 0,
  });

  const [tokenBalances, setTokenBalances] = useState({
    Squid: 0,
    sSquid: 0,
    wsSquid: 0,
  });

  const handleChange = (event, newWrapState) => {
    setWrapState(newWrapState);
  };

  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div id="wrap-view">
      <Paper className="wrap-card">
        <Typography variant="h5">Wrap/Unwrap</Typography>
        <br /> <br />
        <Box className="top-row">
          <Box className="top-row-item">
            <Typography variant="h5">sSquid Price</Typography>
            <Typography variant="h6">{priceFormatter.format(topRowInfo.sSquidPrice)}</Typography>
          </Box>

          <Box className="top-row-item">
            <Typography variant="h5">Current Index</Typography>
            <Typography variant="h6">{topRowInfo.currentIndex}</Typography>
          </Box>

          <Box className="top-row-item">
            <Typography variant="h5">wsSquid Price</Typography>
            <Typography variant="h6">{priceFormatter.format(topRowInfo.wsSquidPrice)}</Typography>
          </Box>
        </Box>
        <br /> <br />
        <Box>
          <Tabs value={wrapState} onChange={handleChange} indicatorColor="primary" aria-label="basic tabs example">
            <Tab label="Wrap" value="wrap" />
            <Tab label="Unwrap" value="unwrap" />
          </Tabs>
        </Box>
      </Paper>
    </div>
  );
}

export default Wrap;
