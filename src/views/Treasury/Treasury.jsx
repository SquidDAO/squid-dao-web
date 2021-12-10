import { useState } from "react";
import {
  Typography,
  Container,
  useMediaQuery,
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
function createData(strategy, deployedAmount, currentValue, yieldValue) {
  return { strategy, deployedAmount, currentValue, yieldValue };
}

const rows = [
  createData("Strategy A", 159, 6.0, 24),
  createData("Strategy B", 237, 9.0, 37),
  createData("Strategy C", 262, 16.0, 24),
  createData("Strategy D", 305, 3.7, 67),
  createData("Strategy E", 356, 16.0, 49),
];
function Treasury() {
  const [view, setView] = useState(0);
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const changeView = (event, newView) => {
    setView(newView);
  };

  return (
    <div id="treasury-view">
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Typography variant="h5" style={{ marginBottom: 20, fontWeight: "bold" }}>
          Treasury
        </Typography>
        <TableContainer component={Paper} style={{ borderRadius: "10px" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Strategy</TableCell>
                <TableCell>Deployed Amount (Ξ)</TableCell>
                <TableCell>Current Value (Ξ)</TableCell>
                <TableCell>Yield %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.strategy} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{row.strategy}</TableCell>
                  <TableCell>{row.deployedAmount}</TableCell>
                  <TableCell>{row.currentValue}</TableCell>
                  <TableCell>{row.yieldValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>1</TableCell>
              <TableCell>2</TableCell>
              <TableCell>3</TableCell>
            </TableRow>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
}

export default Treasury;
