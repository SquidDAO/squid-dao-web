import {
  Button,
  Typography,
  Box,
  SvgIcon,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ButtonBase,
  CircularProgress,
} from "@material-ui/core";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { useAppSelector, useWeb3Context } from "src/hooks";
import { trim } from "../../helpers";
import { changeZapTokenAllowance, executeZap, getZapTokenAllowance } from "src/slices/ZapSlice";
import BondLogo from "../../components/BondLogo";
import { ReactComponent as DownIcon } from "../../assets/icons/arrow-down.svg";
import { ReactComponent as FirstStepIcon } from "../../assets/icons/step-1.svg";
import { ReactComponent as SecondStepIcon } from "../../assets/icons/step-2.svg";
import { ReactComponent as CompleteStepIcon } from "../../assets/icons/step-complete.svg";
import { ReactComponent as ZapperIcon } from "../../assets/icons/powered-by-zapper.svg";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import "./zap.scss";

const iconStyle = { height: "24px", width: "24px", zIndex: 1, fill: "white" };
const iconStyle2 = { height: "24px", width: "24px", zIndex: 1, fill: "black" };
const viewBox = "-8 -12 48 48";
const buttonIconStyle = { height: "16px", width: "16px", marginInline: "6px" };

const useStyles = makeStyles(theme => ({
  ApprovedButton: {
    backgroundColor: theme.palette.type === "light" ? "#9EC4AB !important" : "#92A799 !important",
  },
  ApprovedText: {
    color: theme.palette.type === "light" ? "#fff" : "#333333",
  },
}));

function BondZap({ bond }) {
  const { address, chainID, provider } = useWeb3Context();

  const dispatch = useDispatch();
  const classes = useStyles();
  const tokens = useAppSelector(state => state.zap.balances);
  const isTokensLoading = useAppSelector(state => state.zap.balancesLoading);
  const isChangeAllowanceLoading = useAppSelector(state => state.zap.changeAllowanceLoading);
  const isExecuteZapLoading = useAppSelector(state => state.zap.stakeLoading);

  const [zapToken, setZapToken] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputQuantity, setInputQuantity] = useState("");
  const [outputQuantity, setOutputQuantity] = useState("");

  useEffect(() => {
    if (!tokens[zapToken]) {
      setZapToken(null);
    }
  }, [zapToken]);

  const handleSelectZapToken = token => {
    setZapToken(token);
    handleClose();
  };

  const handleOpen = () => {
    setModalOpen(true);
  };
  const handleClose = () => setModalOpen(false);

  const ethPrice = useAppSelector(state => {
    return state.app.ethPrice;
  });

  const lpPrice = ethPrice * bond.underlyingPrice;
  const exchangeRate = lpPrice / tokens[zapToken]?.price;

  const setZapTokenQuantity = q => {
    if (q == null || q === "") {
      setInputQuantity("");
      setOutputQuantity("");
      return;
    }
    const amount = Number(q);
    setInputQuantity(amount);
    setOutputQuantity(amount / exchangeRate);
  };

  const setOutputTokenQuantity = q => {
    if (q == null || q === "") {
      setInputQuantity("");
      setOutputQuantity("");
      return;
    }
    const amount = Number(q);
    setOutputQuantity(amount);
    setInputQuantity(amount * exchangeRate);
  };

  const currentTokenAllowance = useAppSelector(state => state.zap.allowances[zapToken]);
  const checkTokenAllowance = (tokenAddress, tokenSymbol) => {
    if (tokenAddress && tokenSymbol) {
      if (currentTokenAllowance == null) {
        dispatch(getZapTokenAllowance({ value: tokenAddress, address, action: tokenSymbol }));
      } else {
        return currentTokenAllowance;
      }
    } else {
      return false;
    }
  };

  const isTokenAllowanceFetched = currentTokenAllowance != null;
  const initialTokenAllowance = useMemo(
    () => checkTokenAllowance(tokens[zapToken]?.address, zapToken),
    [zapToken, isTokenAllowanceFetched],
  );

  const onSeekApproval = async () => {
    dispatch(
      changeZapTokenAllowance({
        address,
        value: tokens[zapToken]?.address,
        provider,
        action: zapToken,
      }),
    );
  };

  const onZap = async () =>
    dispatch(
      executeZap({
        address,
        provider,
        slippage: 0.02,
        sellAmount: ethers.utils.parseUnits(inputQuantity.toString(), tokens[zapToken]?.decimals),
        tokenAddress: tokens[zapToken]?.address,
        networkID: chainID,
      }),
    );

  const isAllowanceTxSuccess =
    initialTokenAllowance !== currentTokenAllowance && initialTokenAllowance != null && currentTokenAllowance != null;

  const downIcon = <SvgIcon component={DownIcon} viewBox={viewBox} style={iconStyle}></SvgIcon>;
  const downIcon2 = <SvgIcon component={DownIcon} viewBox={viewBox} style={iconStyle2}></SvgIcon>;

  const zapperCredit = (
    <Box display="flex" alignItems="center" justifyContent="center" paddingTop="32px" width="100%">
      <SvgIcon component={ZapperIcon} viewBox="80 -20 100 80" style={{ width: "200px", height: "40px" }} />
    </Box>
  );

  return (
    <>
      <FormControl className="zap-input" variant="outlined" color="primary">
        <InputLabel htmlFor="amount-input"></InputLabel>
        {zapToken !== null ? (
          <div className="d-flex flex-column align-items-end">
            <Box flexDirection="row" display="flex" alignItems="center">
              <Typography color="textSecondary">{`Balance ${trim(tokens[zapToken]?.balance, 2)}`}</Typography>
              <Box width="10px" />
              <ButtonBase onClick={() => setZapTokenQuantity(tokens[zapToken]?.balance)}>
                <Typography>
                  <b>Max</b>
                </Typography>
              </ButtonBase>
            </Box>
            <OutlinedInput
              id="zap-amount-input"
              type="number"
              placeholder="Enter Amount"
              className="zap-input"
              disabled={false}
              value={inputQuantity}
              onChange={e => setZapTokenQuantity(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minWidth: "50px",
                    }}
                  >
                    <Box flexDirection="column" display="flex">
                      <Box flexDirection="row" display="flex" alignItems="center" justifyContent="flex-end">
                        <ButtonBase onClick={handleOpen}>
                          <Avatar src={tokens[zapToken]?.tokenImageUrl} style={{ height: "30px", width: "30px" }} />
                          <Box width="10px" />
                          <Typography>{tokens[zapToken]?.symbol}</Typography>
                          {downIcon2}
                        </ButtonBase>
                      </Box>
                    </Box>
                  </div>
                </InputAdornment>
              }
            />
          </div>
        ) : (
          <Box className="zap-input">
            <Button variant="contained" className="zap-input" onClick={handleOpen} color="primary">
              <Box flexDirection="row" display="flex" alignItems="center" justifyContent="end" flexGrow={1}>
                <Typography>
                  <div>Select a Token</div>
                </Typography>
                {downIcon}
              </Box>
            </Button>
          </Box>
        )}
      </FormControl>
      <Box marginY="12px" minHeight="24px" display="flex" justifyContent="center" alignItems="center" width="100%">
        {downIcon2}
      </Box>
      <FormControl className="zap-input" variant="outlined" color="primary">
        <InputLabel htmlFor="amount-input"></InputLabel>
        <div className="d-flex flex-column align-items-end">
          <Box flexDirection="row" display="flex" alignItems="center">
            <Typography color="textSecondary">{`Balance ${trim(bond.balance, 2)}`}</Typography>
          </Box>
          <OutlinedInput
            id="zap-amount-output"
            type="number"
            placeholder="Enter Amount"
            className="zap-input"
            value={outputQuantity}
            disabled={zapToken == null}
            onChange={e => setOutputTokenQuantity(e.target.value)}
            labelWidth={0}
            endAdornment={
              <InputAdornment position="end">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minWidth: "50px",
                  }}
                >
                  <Box flexDirection="column" display="flex">
                    <Box flexDirection="row" display="flex" alignItems="center" justifyContent="flex-end">
                      <BondLogo bond={bond} />
                      <Box width="10px" />
                      <Typography>SQUID-ETH LP</Typography>
                    </Box>
                  </Box>
                </div>
              </InputAdornment>
            }
          />
        </div>
      </FormControl>
      <Box justifyContent="space-between" flexDirection="row" display="flex" width="100%" marginY="12px">
        <Typography>
          <div>Max Slippage</div>
        </Typography>
        <Typography>2.0%</Typography>
      </Box>
      <Box justifyContent="space-between" flexDirection="row" display="flex" width="100%" marginY="12px">
        <Typography>
          <div>Exchange Rate</div>
        </Typography>
        <Typography>
          {zapToken == null ? "nil" : `${trim(exchangeRate, 8)} ${tokens[zapToken]?.symbol}`} = 1 LP
        </Typography>
      </Box>
      <Box
        justifyContent="space-between"
        flexDirection="row"
        display="flex"
        marginTop="12px"
        marginBottom="36px"
        width="100%"
      >
        <Typography>
          <div>Minimum You Get</div>
        </Typography>
        <Typography>{trim(Number(outputQuantity) * 0.98, 2)} LP</Typography>
      </Box>
      {initialTokenAllowance ? (
        <Button
          fullWidth
          className="zap-stake-button"
          variant="contained"
          color="primary"
          disabled={zapToken == null || isExecuteZapLoading || outputQuantity === ""}
          onClick={onZap}
        >
          {isExecuteZapLoading ? (
            <div>Pending...</div>
          ) : outputQuantity === "" ? (
            <div>Enter Amount</div>
          ) : (
            <div>Zap</div>
          )}
        </Button>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              className="zap-stake-button"
              variant="contained"
              color="primary"
              disabled={zapToken == null || isTokensLoading || isAllowanceTxSuccess || isChangeAllowanceLoading}
              onClick={onSeekApproval}
              classes={isAllowanceTxSuccess ? { disabled: classes.ApprovedButton } : {}}
            >
              <Box display="flex" flexDirection="row">
                {isAllowanceTxSuccess ? (
                  <>
                    <SvgIcon component={CompleteStepIcon} style={buttonIconStyle} viewBox={"0 0 18 18"} />
                    <Typography classes={{ root: classes.ApprovedText }}>
                      <div>Approved</div>
                    </Typography>
                  </>
                ) : (
                  <>
                    <SvgIcon component={FirstStepIcon} style={buttonIconStyle} viewBox={"0 0 16 16"} />
                    <Typography>{isChangeAllowanceLoading ? "Pending..." : "Approve"}</Typography>
                  </>
                )}
              </Box>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              className="zap-stake-button"
              variant="contained"
              color="primary"
              disabled={!currentTokenAllowance || isExecuteZapLoading || outputQuantity === ""}
              onClick={onZap}
            >
              <Box display="flex" flexDirection="row" alignItems="center">
                <SvgIcon component={SecondStepIcon} style={buttonIconStyle} viewBox={"0 0 16 16"} />

                <Typography>{outputQuantity === "" ? "Enter Amount" : "Zap"}</Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>
      )}
      {zapperCredit}
      <Dialog onClose={handleClose} open={modalOpen} keepMounted fullWidth maxWidth="xs" id="zap-select-token-modal">
        <DialogTitle>
          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
            <Button onClick={handleClose}>
              <SvgIcon component={XIcon} color="primary" />
            </Button>
            <Box paddingRight={6}>
              <Typography id="migration-modal-title" variant="h6" component="h2">
                <div>Select Zap Token</div>
              </Typography>
            </Box>
            <Box />
          </Box>
        </DialogTitle>
        <Box paddingX="36px" paddingBottom="36px" paddingTop="12px">
          {isTokensLoading ? (
            <Box display="flex" justifyItems="center" flexDirection="column" alignItems="center">
              <CircularProgress />
              <Box height={24} />
              <Typography>
                <div>Dialing Zapper...</div>
              </Typography>
            </Box>
          ) : Object.entries(tokens).length == 0 ? (
            <Box display="flex" justifyContent="center">
              <Typography>
                <div>Ser, you have no assets...</div>
              </Typography>
            </Box>
          ) : (
            <Paper style={{ maxHeight: 300, overflow: "auto", borderRadius: 10 }}>
              <List style={{ pt: 0 }}>
                {Object.entries(tokens)
                  .filter(token => !token[1].hide)
                  .sort((tokenA, tokenB) => tokenB[1].balanceUSD - tokenA[1].balanceUSD)
                  .map(token => (
                    <ListItem button onClick={() => handleSelectZapToken(token[0])} key={token[1].symbol}>
                      <ListItemAvatar>
                        <Avatar src={token[1].tokenImageUrl} />
                      </ListItemAvatar>
                      <ListItemText primary={token[1].symbol} />
                      <Box flexGrow={10} />
                      <ListItemText
                        style={{ primary: { justify: "center" } }}
                        primary={`$${trim(token[1].balanceUSD, 2)}`}
                        secondary={trim(token[1].balance, 4)}
                      />
                    </ListItem>
                  ))}
              </List>
            </Paper>
          )}
          {zapperCredit}
        </Box>
      </Dialog>
    </>
  );
}

export default BondZap;
