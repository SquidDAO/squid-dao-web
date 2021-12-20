import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { InputGroup } from "react-bootstrap";
import TabPanel from "../../components/TabPanel";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import styled from "styled-components";
import addYears from "date-fns/addYears";
import format from "date-fns/format";
import { changeApproval, createLock } from "../../slices/VotingEscrowSlice";
import { isPendingTxn, txnButtonText } from "../../slices/PendingTxnsSlice";
import { commify } from "../../helpers";
import { addSeconds } from "date-fns";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();

  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [stakeYear, setStakeYear] = useState(0);

  const sSquidBalance = useSelector(state => {
    return state.account.balances && state.account.balances.sohm;
  });
  const stakeAllowance = useSelector(state => {
    return (state.account.votingEscrow && state.account.votingEscrow.sSquidStake) || 0;
  });
  const isLoading = useSelector(state => {
    return state.account.loading || state.votingEscrow.loading;
  });
  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });
  const lockedBalance = useSelector(state => state.votingEscrow.stake.lockedBalance);
  const unlockTime = useSelector(state => state.votingEscrow.stake.unlockTime);
  const hasLocked = useSelector(state => state.votingEscrow.stake.unlockTime !== "0");
  const reward = useSelector(state => state.votingEscrow.reward.claimable);
  const wsSquidRate = useSelector(state => Number(state.votingEscrow.value.wsSquid));

  const setMax = () => {
    setQuantity(sSquidBalance);
  };

  const onApproval = async () => {
    await dispatch(changeApproval({ address, provider, networkID: chainID }));
  };

  const onStake = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    if (gweiValue.gt(ethers.utils.parseUnits(sSquidBalance, "gwei"))) {
      return dispatch(error("You cannot lock more than your sSQUID balance."));
    }

    const unlockTime = Math.floor(addSeconds(new Date(), stakeYear * 365 * 86400).getTime() / 1000);

    await dispatch(createLock({ address, networkID: chainID, provider, sSQUIDAmount: gweiValue, unlockTime }));
  };

  const hasAllowance = stakeAllowance > 0;
  const hasEnoughAllowance = stakeAllowance > Number(quantity);

  const changeView = (event, newView) => {
    setView(newView);
  };

  const stakeCardInfo = useMemo(() => {
    const now = new Date();

    return [1, 2, 3, 4].map(year => {
      return {
        duration: year,
        active: year === stakeYear,
        unlock: format(addYears(now, year), "MMM yyyy"),
      };
    });
  }, [stakeYear]);

  useEffect(() => {
    if (!isLoading && stakeYear === 0) {
      setStakeYear(1);
    }
  }, [isLoading, stakeYear]);

  return (
    <div style={{ maxWidth: 833, width: "100%", marginLeft: "auto", marginRight: "auto" }}>
      <Grid container spacing={2} alignItems="flex-end" className="stake-top-metrics">
        {!isLoading &&
          !hasLocked &&
          stakeCardInfo.map((info, idx) => {
            return (
              <Grid item xs={6} sm={6} md={3} lg={3} key={idx}>
                <div
                  className={`stake-card ${info.duration === stakeYear && "active"}`}
                  onClick={() => setStakeYear(info.duration)}
                >
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#200A2B" }}>Lock sSQUID for</div>
                  <div style={{ fontSize: "24px", fontWeight: "600", color: "#7F7FD5", margin: "10px 0" }}>
                    <span style={{ fontSize: "32px" }}>{info.duration}</span> Year
                  </div>
                  {/*<div className="apy-title">Apy</div>*/}
                  {/*<div className="apy">43.55%</div>*/}
                  <div className="bottom-row">
                    <div className="bottom">
                      <span>Lock</span>
                      <span style={{ color: "#200A2B" }}>{info.duration} Year</span>
                    </div>
                    <div className="bottom">
                      <span>End Date</span>
                      <span style={{ color: "#200A2B" }}>{info.unlock}</span>
                    </div>
                  </div>
                </div>
              </Grid>
            );
          })}
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Paper className="ohm-card">
            <Tabs
              centered
              value={view}
              textColor="primary"
              indicatorColor="primary"
              onChange={changeView}
              aria-label="bond tabs"
            >
              <Tab label="Lock sSQUID" {...a11yProps(0)} />
              {/*<Tab label="Unstake" {...a11yProps(1)} />*/}
            </Tabs>

            <TabPanel value={view} index={0}>
              <Box className="bond-data">
                <div className="data-row">
                  {address && !hasAllowance ? (
                    <>
                      <div style={{ textAlign: "left", lineHeight: "16px" }}>
                        First time locking sSQUID?
                        <br />
                        Please approve Squid Dao to use your sSQUID for locking
                      </div>
                      <Button variant="contained" color="primary" onClick={() => onApproval()}>
                        {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                      </Button>
                    </>
                  ) : (
                    !hasLocked && (
                      <>
                        <FormControl className="ohm-input" variant="outlined" color="primary">
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
                        {hasEnoughAllowance ? (
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "create_lock")}
                            onClick={() => {
                              onStake();
                            }}
                          >
                            {txnButtonText(pendingTransactions, "create_lock", "Lock sSQUID")}
                          </Button>
                        ) : (
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                            onClick={() => {
                              onApproval();
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                          </Button>
                        )}
                      </>
                    )
                  )}
                </div>
                <div className="data-row">
                  <Typography>Your sSQUID Balance</Typography>
                  <Typography>
                    {isLoading ? <Skeleton width="100px" /> : <>{commify(sSquidBalance, 6)} sSQUID</>}
                  </Typography>
                </div>
                <div className="data-row">
                  <Typography>Your Locked Balance</Typography>
                  <Typography>
                    {isLoading ? <Skeleton width="100px" /> : <>{commify(lockedBalance, 6)} sSQUID</>}
                  </Typography>
                </div>
                <div className="data-row">
                  <Typography>Mint Ratio</Typography>
                  <Typography>
                    {isLoading ? (
                      <Skeleton width="100px" />
                    ) : (
                      !hasLocked && <>{(0.25 * stakeYear * wsSquidRate).toFixed(6)} vewsSQUID per sSQUID</>
                    )}
                  </Typography>
                </div>
                <div className="data-row">
                  <Typography>Rewards</Typography>
                  <Typography>{isLoading ? <Skeleton width="100px" /> : <>{commify(reward, 6)} wsSQUID</>}</Typography>
                </div>
                {!isLoading && hasLocked && (
                  <div>
                    Unlock available in{" "}
                    <span style={{ color: "#7F7FD5" }}>
                      {format(new Date(Number(unlockTime) * 1000), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </Box>
            </TabPanel>

            {/*<TabPanel value={view} index={1}>*/}
            {/*</TabPanel>*/}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

const StyledInputGroup = styled(InputGroup)`
  width: 300px;
  border: 1px solid #b5b5b5 !important;
  border-radius: 20px;
  margin-right: 10px;
`;

const Input = styled(FormControl)`
  width: 60%;
  height: 40px;
  color: black;
  border-radius: 20px !important;
  border: unset;
  overflow: hidden;
  background-color: white;
  font-weight: bold;
  outline: none !important;
  box-shadow: none !important;
`;

const MaxButton = styled.span`
  position: absolute;
  top: 30%;
  right: 16px;
  font-weight: 600;
  color: #7f7fd5;
  z-index: 3;
  font-size: 1rem;
`;

export default Stake;
