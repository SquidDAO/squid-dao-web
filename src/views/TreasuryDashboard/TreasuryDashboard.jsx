import { useEffect, useState } from "react";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Chart from "../../components/Chart/Chart.jsx";
import { trim, formatCurrency, formatEth } from "../../helpers";
import {
  treasuryDataQuery,
  rebasesDataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from "./treasuryData.js";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import apollo from "../../lib/apolloClient";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState(null);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });

  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const backingPerOhm = useSelector(state => {
    return state.app.treasuryMarketValue / state.app.circSupply;
  });

  const wsOhmPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  useEffect(() => {
    apollo(treasuryDataQuery).then(r => {
      let metrics = r.data.protocolMetrics.map(entry =>
        Object.entries(entry).reduce((obj, [key, value]) => ((obj[key] = parseFloat(value)), obj), {}),
      );
      metrics = metrics.filter(pm => pm.treasuryMarketValue > 0);
      setData(metrics);

      let staked = r.data.protocolMetrics.map(entry => ({
        staked: (parseFloat(entry.sOhmCirculatingSupply) / parseFloat(entry.ohmCirculatingSupply)) * 100,
        timestamp: entry.timestamp,
      }));
      staked = staked.filter(pm => pm.staked < 100);
      setStaked(staked);

      let runway = metrics.filter(pm => pm.runway10k > 5);
      setRunway(runway);
    });

    apollo(rebasesDataQuery).then(r => {
      let apy = r.data.rebases.map(entry => ({
        apy: Math.pow(parseFloat(entry.percentage) + 1, 365 * 3) * 100,
        timestamp: entry.timestamp,
      }));

      apy = apy.filter(pm => pm.apy < 300000);

      setApy(apy);
    });
  }, []);

  return (
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Typography variant="h5" style={{ marginBottom: 20, fontWeight: "bold" }}>
          Dashboard
        </Typography>
        <Grid container spacing={2} className="data-grid" style={{ marginBottom: "1rem" }}>
          <Grid item lg={3} md={3} sm={12} xs={12}>
            <Paper className="ohm-card">
              <Typography variant="h6" color="textSecondary">
                Market Cap
              </Typography>
              <Typography variant="h5">
                {marketCap && formatEth(marketCap, 0)}
                {!marketCap && <Skeleton type="text" />}
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={3} md={3} sm={12} xs={12}>
            <Paper className="ohm-card">
              <Typography variant="h6" color="textSecondary">
                Circulating Supply (total)
              </Typography>
              <Typography variant="h5">
                {circSupply && totalSupply ? (
                  parseInt(circSupply) + " / " + parseInt(totalSupply)
                ) : (
                  <Skeleton type="text" />
                )}
              </Typography>{" "}
            </Paper>
          </Grid>
          <Grid item lg={3} md={3} sm={12} xs={12}>
            <Paper className="ohm-card">
              <Typography variant="h6" color="textSecondary">
                Backing per SQUID
              </Typography>
              <Typography variant="h5">
                {backingPerOhm ? formatEth(backingPerOhm, 2) : <Skeleton type="text" />}
              </Typography>{" "}
            </Paper>
          </Grid>
          <Grid item lg={3} md={3} sm={12} xs={12}>
            <Paper className="ohm-card">
              <Typography variant="h6" color="textSecondary">
                Current Index
                <InfoTooltip
                  message={
                    "The current index tracks the amount of sSQUID accumulated since the beginning of staking. Basically, how much sSQUID one would have if they staked and held a single SQUID from day 1."
                  }
                />
              </Typography>
              <Typography variant="h5">
                {currentIndex ? trim(currentIndex, 2) + " sSQUID" : <Skeleton type="text" />}
              </Typography>{" "}
            </Paper>
          </Grid>
        </Grid>

        <Zoom in={true}>
          <Grid container spacing={2} className="data-grid">
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <Chart
                  type="area"
                  data={data}
                  dataKey={["totalValueLocked"]}
                  stopColor={[["#7558C6", "rgba(255, 110, 214, 0.2)"]]}
                  headerText="Total Value Deposited"
                  headerSubText={`${data && formatEth(data[0].totalValueLocked)}`}
                  bulletpointColors={bulletpoints.tvl}
                  itemNames={tooltipItems.tvl}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.tvl}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <Chart
                  type="stack"
                  data={data}
                  dataKey={["treasuryEthMarketValue"]}
                  stopColor={[
                    ["#7558C6", "rgba(255, 110, 214, 0.2)"],
                    ["#58BFC6", "rgba(110, 151, 255, 0.2)"],
                    ["#DC30EB", "#EA98F1"],
                    ["#8BFF4D", "#4C8C2A"],
                  ]}
                  headerText="Market Value of Treasury Assets"
                  headerSubText={`${data && formatEth(data[0].treasuryMarketValue)}`}
                  bulletpointColors={bulletpoints.coin}
                  itemNames={tooltipItems.coin}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.mvt}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <Chart
                  type="stack"
                  data={data}
                  format="currency"
                  dataKey={["treasuryEthRiskFreeValue"]}
                  stopColor={[
                    ["#7558C6", "rgba(255, 110, 214, 0.2)"],
                    ["#58BFC6", "rgba(110, 151, 255, 0.2)"],
                    ["#000", "#fff"],
                    ["#000", "#fff"],
                  ]}
                  headerText="Risk Free Value of Treasury Assets"
                  headerSubText={`${data && formatEth(data[0].treasuryRiskFreeValue)}`}
                  bulletpointColors={bulletpoints.coin}
                  itemNames={tooltipItems.coin}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.rfv}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="area"
                  data={data}
                  dataKey={["treasurySquidEthPOL"]}
                  stopColor={[["#7558C6", "rgba(255, 110, 214, 0.2)"]]}
                  headerText="Protocol Owned Liquidity SQUID-WETH"
                  headerSubText={`${data && trim(data[0].treasurySquidEthPOL, 2)}% `}
                  dataFormat="percent"
                  bulletpointColors={bulletpoints.pol}
                  itemNames={tooltipItems.pol}
                  itemType={itemType.percentage}
                  infoTooltipMessage={tooltipInfoMessages.pol}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  isPOL={true}
                />
              </Paper>
            </Grid>
            {/*  Temporarily removed until correct data is in the graph */}
            {/* <Grid item lg={6} md={12} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="bar"
                  data={data}
                  dataKey={["holders"]}
                  headerText="Holders"
                  stroke={[theme.palette.text.secondary]}
                  headerSubText={`${data && data[0].holders}`}
                  bulletpointColors={bulletpoints.holder}
                  itemNames={tooltipItems.holder}
                  itemType={""}
                  infoTooltipMessage={tooltipInfoMessages.holder}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid> */}

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="area"
                  data={staked}
                  dataKey={["staked"]}
                  stopColor={[["#7558C6", "rgba(255, 110, 214, 0.2)"]]}
                  headerText="SQUID Staked"
                  dataFormat="percent"
                  headerSubText={`${staked && trim(staked[0].staked, 2)}% `}
                  isStaked={true}
                  bulletpointColors={bulletpoints.staked}
                  infoTooltipMessage={tooltipInfoMessages.staked}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="line"
                  scale="log"
                  data={apy}
                  dataKey={["apy"]}
                  color={theme.palette.text.primary}
                  stroke={[theme.palette.text.primary]}
                  headerText="APY over time"
                  dataFormat="percent"
                  headerSubText={`${apy && trim(apy[0].apy, 2)}%`}
                  bulletpointColors={bulletpoints.apy}
                  itemNames={tooltipItems.apy}
                  itemType={itemType.percentage}
                  infoTooltipMessage={tooltipInfoMessages.apy}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="line"
                  data={runway}
                  dataKey={["runwayCurrent"]}
                  color={theme.palette.text.primary}
                  stroke={[theme.palette.text.primary]}
                  headerText="Runway Available"
                  headerSubText={`${data && trim(data[0].runwayCurrent, 1)} Days`}
                  dataFormat="days"
                  bulletpointColors={bulletpoints.runway}
                  itemNames={tooltipItems.runway}
                  itemType={""}
                  infoTooltipMessage={tooltipInfoMessages.runway}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>
          </Grid>
        </Zoom>
      </Container>
    </div>
  );
}

export default TreasuryDashboard;
