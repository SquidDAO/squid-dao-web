import React from "react";
import { useLocation } from "react-router-dom";

import ReactGA from "react-ga4";
const TRACKING_ID = "G-MQYR8021LF";

export default function useGoogleAnalytics() {
  const location = useLocation();

  React.useEffect(() => {
    ReactGA.initialize(TRACKING_ID);
  }, []);

  React.useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;
    ReactGA.send({ hitType: "pageview", page: currentPath });
  }, [location]);
}
