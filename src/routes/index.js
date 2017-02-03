import App from '../components/App';

const loadRoute = (cb) => {
  // IMPORTANT: use `require.ensure` not `System.import` because "babel-plugin-remove-webpack"
  // is used on the "sever" build to transform `require.ensure` to synchronus `require`
  require.ensure([
    `../components/Child`,
  ], function(require) {
    // Now require it `sync`
    const Child = require(`../components/Child`);

    cb(null, Child.default || Child);
  });
};

/* eslint require-jsdoc:0,no-inline-comments:0 */

export default function(/* store, opts = {env} */) {
  return {
    path: `/`,
    component: App,
    childRoutes: [
      {
        path: `bleep`,
        childRoutes: [
          {
            path: `foo`,
          },
          {
            path: `bar`,
          },
        ],
        getComponent(location, cb) {
          loadRoute(cb);
        },
      },
      {
        path: `bloop`,
        getComponent(location, cb) {
          loadRoute(cb);
        },
      },
      {
        path: `bloosh`,
        getComponent(location, cb) {
          loadRoute(cb);
        },
      },
    ],
  };
}
