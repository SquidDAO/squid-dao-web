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
      <Tabs
        centered
        value={view}
        textColor="primary"
        indicatorColor="primary"
        onChange={changeView}
        aria-label="bond tabs"
      >
        <Tab label="SQUID" {...a11yProps(0)} />
        <Tab label="vewsSQUID" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={view} index={0}>
        <StakeSQUID />
      </TabPanel>
      <TabPanel value={view} index={1}>
        <StakewsSQUID />
      </TabPanel>
    </div>
  );
}

export default Stake;
