import React, { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./Social";
import externalUrls from "./externalUrls";
import { ReactComponent as StakeIcon } from "../../assets/icons/stake.svg";
import { ReactComponent as AuctionIcon } from "../../assets/icons/auction.svg";
import { ReactComponent as BondIcon } from "../../assets/icons/bond.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard.svg";
import { ReactComponent as SquidIcon } from "../../assets/icons/squid.svg";
import { ReactComponent as TreasuryIcon } from "../../assets/icons/treasury.svg";
import { ReactComponent as LockIcon } from "../../assets/icons/lock.svg";
import { trim, shorten } from "../../helpers";
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import useBonds from "../../hooks/Bonds";
import { Paper, Link, Box, Typography, SvgIcon } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel } from "@fortawesome/free-solid-svg-icons";
import "./sidebar.scss";
import { useENS } from "src/hooks/useENS";
import Davatar from "@davatar/react";

function NavContent() {
  const [isActive] = useState();
  const address = useAddress();
  const { bonds } = useBonds();
  const { ensName } = useENS(address);
  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("auction") >= 0 && page === "auction") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("lock") >= 0 && page === "lock") {
      return true;
    }
    if (currentPath.indexOf("treasury") >= 0 && page === "treasury") {
      return true;
    }
    if ((currentPath.indexOf("bonds") >= 0 || currentPath.indexOf("choose_bond") >= 0) && page === "bonds") {
      return true;
    }
    return false;
  }, []);

  return (
    <Paper className="dapp-sidebar">
      <Box className="dapp-sidebar-inner" display="flex" justifyContent="center" flexDirection="column">
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
                <span className="davatar">
                  <Davatar size={20} address={address} />
                </span>
                <Link href={`https://etherscan.io/address/${address}`} target="_blank">
                  {ensName || shorten(address)}
                </Link>
              </div>
            )}
          </Box>

          <div className="dapp-menu-links">
            <div className="dapp-nav" id="navbarNav">
              <Link
                component={NavLink}
                id="dash-nav"
                to="/dashboard"
                isActive={(match, location) => {
                  return checkPage(match, location, "dashboard");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={DashboardIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />
                  Dashboard
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="auction-nav"
                to="/auction"
                isActive={(match, location) => {
                  return checkPage(match, location, "auction");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={AuctionIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />
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
                id="lock-nav"
                to="/lock"
                isActive={(match, location) => {
                  return checkPage(match, location, "lock");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={LockIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />
                  Lock
                </Typography>
              </Link>

              {/*<Link*/}
              {/*  component={NavLink}*/}
              {/*  id="treasury-nav"*/}
              {/*  to="/treasury"*/}
              {/*  isActive={(match, location) => {*/}
              {/*    return checkPage(match, location, "treasury");*/}
              {/*  }}*/}
              {/*  className={`button-dapp-menu ${isActive ? "active" : ""}`}*/}
              {/*>*/}
              {/*  <Typography variant="h6">*/}
              {/*    <SvgIcon color="primary" component={TreasuryIcon} style={{ fill: "none" }} viewBox="0 0 25 24" />*/}
              {/*    Treasury*/}
              {/*  </Typography>*/}
              {/*</Link>*/}

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

              <div className="dapp-menu-data discounts">
                <div className="bond-discounts">
                  <Typography variant="body2">Bond discounts</Typography>
                  {bonds
                    .filter(bond => bond.active)
                    .map((bond, i) => (
                      <Link component={NavLink} to={`/bonds/${bond.name}`} key={i} className={"bond"}>
                        {!bond.bondDiscount ? (
                          <Skeleton variant="text" width={"150px"} />
                        ) : (
                          <Typography variant="body2">
                            {bond.displayName}
                            <span className="bond-pair-roi">
                              {bond.soldOut ? (
                                "Sold Out"
                              ) : (
                                <>{bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%</>
                              )}
                            </span>
                          </Typography>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Box className="dapp-menu-bottom" display="flex" justifyContent="space-between" flexDirection="column">
          <div className="dapp-menu-external-links">
            {Object.keys(externalUrls).map((link, i) => {
              return (
                <Link key={i} href={`${externalUrls[link].url}`} target="_blank">
                  <Typography variant="h6">{externalUrls[link].icon}</Typography>
                  <Typography variant="h6">{externalUrls[link].title}</Typography>
                </Link>
              );
            })}
          </div>
          <div className="dapp-menu-social">
            <Social />
          </div>
        </Box>
      </Box>
    </Paper>
  );
}

export default NavContent;
