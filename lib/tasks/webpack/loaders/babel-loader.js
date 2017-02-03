/* eslint valid-jsdoc:0 */

/**
 * Make the full path for the Babel preset/plugin or it freaks out when
 * webpack tries to build in an external repo
 * @param {String} type preset or plugin
 * @return {Function} curried function passed to `map`
 */
const addFullPathToName = (type) => {
  /**
   * @param {String} name name of the module
   * @return {String} full path to preset/plugin in `node_modules`
   */
  return (name) => {
    let ret;

    if (Array.isArray(name)) {
      const [ modName, ...rest ] = name;
      ret = [ require.resolve(`babel-${type}-${modName}`), ...rest ];
    } else {
      try {
        ret = require.resolve(`babel-${type}-${name}`);
      } catch (err) {
        ret = require.resolve(name);
      }
    }

    return ret;
  };
};

/**
 * Generate the babel-loader based upon environment
 * @param {String} env the NODE_ENV
 * @param {String} target client or server
 * @return {Object} webpack loader configuration
 */
export default function({env, target}) {
  const babelDevPlugins = [
    [ `react-transform`, {
      transforms: [{
        transform: `react-transform-hmr`,
        imports: [`react`],
        locals: [`module`],
      }, {
        transform: `react-transform-catch-errors`,
        imports: [ `react`, `redbox-react` ],
      }],
    }],
  ];
  const babelPlugins = [
    `transform-object-rest-spread`,
    `lodash`,
    [ `transform-runtime`, {
      helpers: false,
      polyfill: false,
      regenerator: true,
      moduleName: `babel-runtime`,
    }],
  ];

  if (env === `development`) {
    babelPlugins.push(...babelDevPlugins);
  } else if (target === `server`) {
    // IMPORTANT: this allows Webpack code splitting using `require.ensure` to be replaced
    // with synchronus `require` on the server. This is important because asynchronus
    // operations in react-router do not work with isomorphic templating
    babelPlugins.push(`remove-webpack`);
  }

  return {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: `babel-loader`,
    options: {
      presets: [
        [ `es2015`, { modules: false }],
        `es2017`,
        `react`,
      ].map(addFullPathToName(`preset`)),
      plugins: babelPlugins.map(addFullPathToName(`plugin`)),
      babelrc: false,
    },
  };
}
