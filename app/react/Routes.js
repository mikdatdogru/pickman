import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import App from './App';
import Home from './components/Home';

export default () => (
  <App>
    <Switch>
      <Route path="/" component={Home} />

      {/* <Redirect to={'/clipList'} /> */}
    </Switch>
  </App>
);
