import { formatEth, trim } from "../../helpers";
import BondLogo from "../../components/BondLogo";
import { Box, Button, Link, Paper, Typography, TableRow, TableCell, SvgIcon, Slide } from "@material-ui/core";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import useBonds from "src/hooks/Bonds";

export function BondDataCard({ bond }) {
  const { loading } = useBonds();
  const isBondLoading = !bond.bondPrice ?? true;

  return (
    <Slide direction="up" in={true}>
      <Paper id={`${bond.name}--bond`} className="bond-data-card ohm-card">
        <div className="bond-pair">
          <BondLogo bond={bond} />
          <div className="bond-name">
            <Typography>{bond.displayName}</Typography>
            {bond.isLP && (
              <div>
                <Link href={bond.lpUrl} target="_blank">
                  <Typography variant="body1">
                    View Contract
                    <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                  </Typography>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="data-row">
          <Typography>Price</Typography>
          <Typography className="bond-price">
            <>{isBondLoading ? <Skeleton width="50px" /> : bond.soldOut ? "Sold Out" : formatEth(bond.bondPrice, 2)}</>
          </Typography>
        </div>

        <div className="data-row">
          <Typography>ROI</Typography>
          <Typography>
            {isBondLoading ? (
              <Skeleton width="50px" />
            ) : bond.soldOut ? (
              "Sold Out"
            ) : (
              `${trim(bond.bondDiscount * 100, 2)}%`
            )}
          </Typography>
        </div>

        <div className="data-row">
          <Typography>Purchased</Typography>
          <Typography>{isBondLoading ? <Skeleton width="80px" /> : formatEth(bond.purchased)}</Typography>
        </div>
        {!bond.soldOut && (
          <Link component={NavLink} to={`/bonds/${bond.name}`}>
            <Button variant="outlined" color="primary" fullWidth>
              <Typography variant="h5">Bond {bond.displayName}!!!</Typography>
            </Button>
          </Link>
        )}
      </Paper>
    </Slide>
  );
}

export function BondTableData({ bond }) {
  // Use BondPrice as indicator of loading.
  const isBondLoading = !bond.bondPrice ?? true;
  const isSoldOut = bond.soldOut;
  // const isBondLoading = useSelector(state => !state.bonding[bond]?.bondPrice ?? true);

  return (
    <TableRow id={`${bond.name}--bond`}>
      <TableCell align="left" className="bond-name-cell">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <Typography variant="body1">{bond.displayName}</Typography>
          {bond.isLP && (
            <Link color="primary" href={bond.lpUrl} target="_blank">
              <Typography variant="body1">
                View Contract
                <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
              </Typography>
            </Link>
          )}
        </div>
      </TableCell>
      <TableCell align="left">
        <Typography>
          <>{isBondLoading ? <Skeleton width="50px" /> : isSoldOut ? "N/A" : formatEth(bond.bondPrice, 2)}</>
        </Typography>
      </TableCell>
      <TableCell align="left">
        {isBondLoading ? <Skeleton /> : isSoldOut ? "Sold Out" : `${trim(bond.bondDiscount * 100, 2)}%`}
      </TableCell>
      <TableCell align="right">{isBondLoading ? <Skeleton /> : formatEth(bond.purchased)}</TableCell>
      <TableCell>
        {!isSoldOut && (
          <Link component={NavLink} to={`/bonds/${bond.name}`}>
            <Button variant="outlined" color="primary">
              <Typography variant="h6">Bond</Typography>
            </Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}
