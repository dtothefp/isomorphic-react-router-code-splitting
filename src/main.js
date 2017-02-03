// Base styling
import 'assets/css/base.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, match } from 'react-router';
import getRoutes from './routes';
import bootstrap from './bootstrap';

const {store, history} = bootstrap({env: `client`});
const rootEl = document.querySelector(`.app`);
const routes = getRoutes(store);

match({ history, routes }, (error, redirectLocation, renderProps) => {
  ReactDOM.render(
    <Provider store={store}>
      <Router {...renderProps} />
    </Provider>,
    rootEl
  );
});
