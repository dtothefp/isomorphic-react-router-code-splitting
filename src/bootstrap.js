import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
// Local dependencies
import * as actions from 'actions';
import rootReducer from 'reducers';
import rootSaga from 'sagas';

/**
 * Redux bootstrap function shared between "client" and "server"
 * @param {String} env the server or client environment
 * @param {String} route only supplied on the server
 * @return {Promise|Object} store and history
 */
export default function({env, route, locale}) { // eslint-disable-line
  const sagaMiddleware = createSagaMiddleware();
  const isDev = process.env.NODE_ENV !== `production` &&
    typeof window === `object` &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    env !== `server`;
  let composeEnhancers = compose;

  /* eslint no-console:0 */

  if (isDev) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});
  }

  const store = createStore(
    rootReducer,
    window.__STORE__ || {},
    composeEnhancers(applyMiddleware(sagaMiddleware))
  );

  if (env === `server`) {
    store.dispatch(actions.init);

    // server bootstrap expects a Promise
    return {store};
  }

  const history = syncHistoryWithStore(browserHistory, store);

  sagaMiddleware.run(rootSaga);

  if (module && module.hot) {
    module.hot.accept(`./reducers`, () => {
      System.import(`./reducers`).then((reducerModule) => {
        const createReducers = reducerModule.default;
        const nextReducers = createReducers(store.asyncReducers);

        store.replaceReducer(nextReducers);
      });
    });
  }

  return {store, history};
}
