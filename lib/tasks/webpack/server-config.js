import globby from 'globby';
import path from 'path';
import webpack from 'webpack';
import fs from 'fs';
import babelLoader from './loaders/babel-loader';
import defineEnv from './define-env-config';

/**
 * This is the Webpack configuration file for creating isomorphic bundles.
 * @param {Object} config global task config
 * @return {Object} webpack isomorphic config
 */
export default function(config) {
  const {
    src,
    isomorphic,
    dest,
    cwd,
    base,
  } = config;
  const {
    entries,
    cwd: isomorphicEntryBase,
    bootstrap = `bootstrap.js`,
  } = isomorphic;

  if (Array.isArray(entries) && entries.indexOf(bootstrap) === -1) {
    entries.push(bootstrap);
  }

  const context = isomorphicEntryBase ? cwd(isomorphicEntryBase) : cwd();
  const entryFps = globby.sync(entries, {
    cwd: context,
  }).reduce((acc, fp) => {
    const basename = path.basename(fp, path.extname(fp));
    const dir = path.basename(path.dirname(fp));
    const key = basename === `index` ? dir : basename;

    return {
      ...acc,
      [key]: `./${fp}`,
    };
  }, {});

  const dependencies = [
    `fs`,
    `react-dom/server`,
    `react/addons`,
    ...fs.readdirSync(cwd(`node_modules`)),
  ];
  const blacklist = [ `.yarn-integrity`, `.bin` ];
  const externals = dependencies.reduce((acc, dep) => {
    if (blacklist.includes(dep)) return acc;

    return {
      ...acc,
      [dep]: `commonjs ${dep}`,
    };
  }, {});

  const output = {
    path: cwd(dest),
    filename: `[name].js`,
    publicPath: `/`,
    libraryTarget: `commonjs-module`,
  };

  const styleLoaders = [
    {
      test: /(components|containers|pages)\/.*\.css$/,
      loader: path.join(__dirname, `loaders`, `server-css-loader`),
    },
    {
      test: /assets\/css\/.*\.css$/,
      loader: path.join(__dirname, `loaders`, `server-css-loader`),
    },
  ];
  const mockLoader = {
    test: /\.jsx$/,
    loader: path.join(__dirname, `loaders`, `server-mocks-loader`),
  };
  const plugins = [
    new webpack.DefinePlugin(
      defineEnv({target: `server`, config})
    ),
    new webpack.ProvidePlugin({
      fetch: `isomorphic-fetch`,
      [`global.fetch`]: `isomorphic-fetch`,
      [`window.fetch`]: `isomorphic-fetch`,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // HACK: prevent webpack isomorphic warning for iconv-loader
    // https://github.com/lynndylanhurley/redux-auth/issues/26
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, `node-noop`),
  ];
  const loaders = [
    babelLoader({env: `production`, target: `server`}),
    mockLoader,
    ...styleLoaders,
    {
      test: /\.svg$/,
      loader: `file-loader`,
    },
  ];

  return {
    target: `node`,
    node: {
      fs: true,
      __dirname: false,
    },
    externals,
    context,
    entry: entryFps,
    output,
    resolve: {
      extensions: [ `.js`, `.jsx`, `.css` ],
      modules: [
        cwd(src),
        base(`node_modules`),
        `node_modules`,
      ],
    },
    plugins,
    module: {
      rules: loaders,
    },
  };
}
