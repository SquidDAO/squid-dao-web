import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import * as React from "react";
import { useState } from "react";
import { trim } from "../../helpers";
import "./wrap.scss";
import TabPanel from "../../components/TabPanel";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Wrap() {
  const [wrapState, setWrapState] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [approved, setApproved] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

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
    setApproved(false);
    setQuantity(0);
  };

  // make this actually work instead of return magic number
  const setMax = () => {
    if (wrapState === 0) {
      setQuantity(10);
    } else {
      setQuantity(20);
    }
  };

  // need to make this function actually do something
  const connect = event => {
    setWalletConnected(true);
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
        {walletConnected ? (
          <Box>
            <Tabs value={wrapState} onChange={handleChange} indicatorColor="primary" aria-label="basic tabs example">
              <Tab label="Wrap" {...a11yProps(0)} />
              <Tab label="Unwrap" {...a11yProps(1)} />
            </Tabs>
            <br /> <br />
            <Box className="wrap-action-row">
              {/*  modify this later to use has allowance instead of my janky approved  */}
              {(!approved && wrapState === 0) || (!approved && wrapState === 1) ? (
                <Box className="help-text">
                  <Typography variant="body1" className="stake-note" color="textSecondary">
                    {wrapState === 0 ? (
                      <>
                        First time wrapping <b>sSQUID</b>?
                        <br />
                        Please approve Squid Dao to use your <b>sSQUID</b> for staking.
                      </>
                    ) : (
                      <>
                        First time unwrapping <b>wsSQUID</b>?
                        <br />
                        Please approve Squid Dao to use your <b>wsSQUID</b> for unstaking.
                      </>
                    )}
                  </Typography>
                </Box>
              ) : (
                <FormControl className="squid-input" variant="outlined" color="primary">
                  <InputLabel htmlFor="amount-input"></InputLabel>
                  <OutlinedInput
                    id="amount-input"
                    type="number"
                    placeholder="Enter an amount"
                    className="stake-input"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    labelWidth={0}
                    endAdornment={
                      <InputAdornment position="end">
                        <Button variant="text" onClick={setMax} color="inherit">
                          Max
                        </Button>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
              <TabPanel value={wrapState} index={0}>
                {approved ? (
                  <Button className="wrap-button" variant="contained" color="primary">
                    Wrap sSquid
                  </Button>
                ) : (
                  <Button className="wrap-button" variant="contained" color="primary" onClick={e => setApproved(true)}>
                    Approve
                  </Button>
                )}
              </TabPanel>
              <TabPanel value={wrapState} index={1}>
                {approved ? (
                  <Button className="wrap-button" variant="contained" color="primary">
                    Unwrap wsSquid
                  </Button>
                ) : (
                  <Button className="wrap-button" variant="contained" color="primary" onClick={e => setApproved(true)}>
                    Approve
                  </Button>
                )}
              </TabPanel>
            </Box>
            <br /> <br />
            <Box className="token-price-box">
              <Typography variant="body1">Squid Balance:</Typography>
              <Typography variant="body1">{trim(tokenBalances.Squid, 6)} Squid</Typography>
            </Box>
            <Box className="token-price-box">
              <Typography variant="body1">sSquid Balance:</Typography>
              <Typography variant="body1">{trim(tokenBalances.sSquid, 6)} sSquid</Typography>
            </Box>
            <Box className="token-price-box">
              <Typography variant="body1">wsSquid Balance:</Typography>
              <Typography variant="body1">{trim(tokenBalances.wsSquid, 6)} wsSquid</Typography>
            </Box>
          </Box>
        ) : (
          <Box className="center-box">
            <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
              Connect Wallet
            </Button>
          </Box>
        )}
      </Paper>
    </div>
  );
}

export default Wrap;
