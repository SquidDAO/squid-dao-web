import { useState } from "react";
import { Tab, Tabs } from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import "./stake.scss";
import StakeSQUID from "./StakeSQUID";
import StakewsSQUID from "./StakewsSQUID";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Stake() {
  const [view, setView] = useState(0);

  const changeView = (event, newView) => {
    setView(newView);
  };

  return (
    <div id="stake-view">
      <StakeSQUID />
    </div>
  );
}

export default Stake;
