import React from 'react';
// import {Route, IndexRoute} from 'react-router';

class App extends React.Component {
  render() {
    return (
      <div className="app">
        <h1>App</h1>
        {this.props.children}
      </div>
    );
  }
}

class Child extends React.Component {
  render() {
    return (
      <h2>Child</h2>
    );
  }
}

// export default (
//   <Route path="/" component={(props) => props.children}>
//     <IndexRoute component={App} />
//     <Route path="mattresses" component={Child} />
//   </Route>
// );

const loadRoute = (type, locale, cb) => {
  console.log(`ROUTE LOADED`, type, locale); // eslint-disable-line
  cb(null, Child);
};

/**
 * Routes
 * @param {object} store - Store object
 * @returns {object} routes - Object containing the routes
 * @todo: Make startup request for translations generalized and based on the URL
 */
export default {
  path: `/`,
  component: App,
  childRoutes: [
    {
      path: `mattresses`,
      getComponent(location, cb) {
        loadRoute(`mattress`, `en`, cb);
      },
    },
    {
      path: `pillows`,
      getComponent(location, cb) {
        loadRoute(`pillow`, `en`, cb);
      },
    },
    {
      path: `sheets`,
      getComponent(location, cb) {
        loadRoute(`sheets`, `en`, cb);
      },
    },
    {
      path: `de/de`,
      childRoutes: [
        {
          path: `matratzen`,
          getComponent(location, cb) {
            loadRoute(`mattress`, `de`, cb);
          },
        },
        {
          path: `kissen`,
          getComponent(location, cb) {
            loadRoute(`pillow`, `de`, cb);
          },
        },
      ],
    },
  ],
};
