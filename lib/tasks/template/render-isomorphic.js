import React from 'react';
import {Provider} from 'react-redux';
import {renderToString} from 'react-dom/server';
import {createMemoryHistory, match, RouterContext} from 'react-router';
import isFunction from 'lodash/isFunction';
import nunjucks from 'nunjucks';
import {log, colors} from 'gulp-util';

/**
 * Render react component and return as a safe string for Nunjucks
 * @param {String} route the route passed to React router
 * @param {Function} routes isomorphic routes function taking the store
 * @param {Object} store Redux store
 * @return {Object} safe string from nunjucks
 */
export default function({route, routes, store}) {
  return new Promise((res, rej) => {
    const history = createMemoryHistory(route);
    const routesComponent = isFunction(routes) ? routes(store, {env: `server`}) : routes;

    match({routes: routesComponent, history}, (err, redirectLocation, renderProps) => {
      if (err) {
        res({
          error: err,
        });
      }

      const [component] = renderProps.components
        .filter(c => !!c)
        .slice(-1);
      const noop = () => Promise.resolve();
      const init = isFunction(component.initState) ? component.initState.bind(component) : noop;

      init(renderProps, store, {env: `server`})
        .then(() => {
          const Component = (
            <Provider store={store}>
              <RouterContext {...renderProps} />
            </Provider>
          );

          try {
            log(`${colors.blue('[render-react]')}: ${colors.magenta(route)}`); // eslint-disable-line quotes
            const html = renderToString(Component);

            res({
              html: new nunjucks.runtime.SafeString(html),
              props: renderProps,
              redirectLocation,
            });
          } catch (err) {
            log(`[render-react-error]`, err.message, err.stack);
            rej({
              error: err,
            });
          }
        }).catch(err => {
          rej({error: err});
        });
    });
  });
}
