/* eslint-disable global-require */
import { Component } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Web3ContextProvider } from "./hooks/web3Context";

import App from "./App";
import store from "./store";
import { AuctionContextProvider } from "./hooks/auctionContext";

export default class Root extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Web3ContextProvider>
        <Provider store={store}>
          <BrowserRouter basename={"/#"}>
            <AuctionContextProvider>
              <Switch>
                {/*<Route path="/squid/:id" exact>*/}
                {/*  <Landing />*/}
                {/*</Route>*/}
                <Route>
                  <App />
                </Route>
              </Switch>
            </AuctionContextProvider>
          </BrowserRouter>
        </Provider>
      </Web3ContextProvider>
    );
  }
}
