import React, { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./Social";
import externalUrls from "./externalUrls";
import { ReactComponent as StakeIcon } from "../../assets/icons/stake.svg";
import { ReactComponent as BondIcon } from "../../assets/icons/bond.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard.svg";
import { ReactComponent as SquidIcon } from "../../assets/icons/squid.svg";
import { trim, shorten } from "../../helpers";
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import useBonds from "../../hooks/Bonds";
import { Paper, Link, Box, Typography, SvgIcon } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel } from "@fortawesome/free-solid-svg-icons";
import "./sidebar.scss";

function NavContent() {
  const [isActive] = useState();
  const address = useAddress();
  const { bonds } = useBonds();
  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if ((currentPath.indexOf("bonds") >= 0 || currentPath.indexOf("choose_bond") >= 0) && page === "bonds") {
      return true;
    }
    return false;
  }, []);

  return (
    <Paper className="dapp-sidebar">
      <Box className="dapp-sidebar-inner" display="flex" justifyContent="space-between" flexDirection="column">
        <div className="dapp-menu-top">
          <Box className="branding-header">
            <Link href="https://squid.xyz/" target="_blank">
              <SvgIcon
                color="primary"
                component={SquidIcon}
                viewBox="0 0 81 80"
                style={{ minWdth: "81px", minHeight: "80px", width: "81px" }}
              />
            </Link>

            {address && (
              <div className="wallet-link">
                <Link href={`https://etherscan.io/address/${address}`} target="_blank">
                  {shorten(address)}
                </Link>
              </div>
            )}
          </Box>

          <div className="dapp-menu-links">
            <div className="dapp-nav" id="navbarNav">
              {/*<Link*/}
              {/*  component={NavLink}*/}
              {/*  id="dash-nav"*/}
              {/*  to="/dashboard"*/}
              {/*  isActive={(match, location) => {*/}
              {/*    return checkPage(match, location, "dashboard");*/}
              {/*  }}*/}
              {/*  className={`button-dapp-menu ${isActive ? "active" : ""}`}*/}
              {/*>*/}
              {/*  <Typography variant="h6">*/}
              {/*    <SvgIcon color="primary" component={DashboardIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />*/}
              {/*    Dashboard*/}
              {/*  </Typography>*/}
              {/*</Link>*/}

              <Link
                component={NavLink}
                id="auction-nav"
                to="/auction"
                isActive={() => false}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <FontAwesomeIcon icon={faGavel} style={{ width: "20px" }} />
                  Auction
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="stake-nav"
                to="/stake"
                isActive={(match, location) => {
                  return checkPage(match, location, "stake");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={StakeIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />
                  Stake
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="bond-nav"
                to="/bonds"
                isActive={(match, location) => {
                  return checkPage(match, location, "bonds");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={BondIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />
                  Bond
                </Typography>
              </Link>

              {/*<div className="dapp-menu-data discounts">*/}
              {/*  <div className="bond-discounts">*/}
              {/*    <Typography variant="body2">Bond discounts</Typography>*/}
              {/*    {bonds.map((bond, i) => (*/}
              {/*      <Link component={NavLink} to={`/bonds/${bond.name}`} key={i} className={"bond"}>*/}
              {/*        {!bond.bondDiscount ? (*/}
              {/*          <Skeleton variant="text" width={"150px"} />*/}
              {/*        ) : (*/}
              {/*          <Typography variant="body2">*/}
              {/*            {bond.displayName}*/}
              {/*            <span className="bond-pair-roi">*/}
              {/*              {bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%*/}
              {/*            </span>*/}
              {/*          </Typography>*/}
              {/*        )}*/}
              {/*      </Link>*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
        {/*  <Box className="dapp-menu-bottom" display="flex" justifyContent="space-between" flexDirection="column">*/}
        {/*    <div className="dapp-menu-external-links">*/}
        {/*      {Object.keys(externalUrls).map((link, i) => {*/}
        {/*        return (*/}
        {/*          <Link key={i} href={`${externalUrls[link].url}`} target="_blank">*/}
        {/*            <Typography variant="h6">{externalUrls[link].icon}</Typography>*/}
        {/*            <Typography variant="h6">{externalUrls[link].title}</Typography>*/}
        {/*          </Link>*/}
        {/*        );*/}
        {/*      })}*/}
        {/*    </div>*/}
        {/*    <div className="dapp-menu-social">*/}
        {/*      <Social />*/}
        {/*    </div>*/}
        {/*  </Box>*/}
      </Box>
    </Paper>
  );
}

export default NavContent;
