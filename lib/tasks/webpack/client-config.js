import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import generateStats from './generate-stats';
import babelLoader from './loaders/babel-loader';
import defineEnv from './define-env-config';

/**
 * This is the Webpack configuration file for local development. It contains
 * local-specific configuration such as the React Hot Loader, as well as:
 *
 * - The entry point of the application
 * - Where the output file should be
 * - Which loaders to use on what files to properly transpile the source
 *
 * For more information, see: http://webpack.github.io/docs/configuration.html
 * @param {Object} config global task config
 * @return {Object} webpack client config
 */
export default function(config) {
  const {
    envVars,
    src,
    dest,
    cwd,
    base,
    env,
    quick,
    stats,
    entry: {js},
  } = config;
  const isDev = env === `development`;
  // TODO: add CDN path here depending upon TRAVIS_BRANCH
  const publicPath = envVars.PUBLIC_PATH;
  // TODO: webpack hashing is messed up, when it gets fixed remove this timestamp
  const timestamp = new Date().getTime();
  const assetEntries = {
    css: {
      development: `[name].css`,
      production: `[name]-[chunkhash]-${timestamp}.css`,
    },
    js: {
      development: `[name].js`,
      production: `[name]-[chunkhash]-${timestamp}.js`,
    },
  };
  const hmrOpts = [
    `path=${publicPath}__webpack_hmr`,
    // enabling this will reload when the server bundle changes which breaks hot reloading
    // `reload=true`,
  ];
  const cssQuery = `modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]&-autoprefixer`;
  const devStyleLoaders = [
    {
      test: /(components|containers|pages)\/.*\.css$/,
      loaders: [
        `style-loader?singleton`,
        `css-loader?${cssQuery}`,
        `postcss-loader`,
      ],
    },
    {
      test: /assets\/css\/.*\.css$/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: `style-loader?singleton`,
        loader: [
          `css-loader?importLoaders=1`,
          `postcss-loader`,
        ],
      }),
    },
  ];
  const prodStyleLoaders = [
    {
      test: /(components|containers|pages)\/.*\.css$/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: `style-loader?singleton`,
        loader: [
          `css-loader?${cssQuery}`,
          `postcss-loader`,
        ],
      }),
    },
    {
      test: /assets\/css\/.*\.css$/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: `style-loader?singleton`,
        loader: [
          `css-loader?importLoaders=1`,
          `postcss-loader`,
        ],
      }),
    },
  ];
  const devPlugins = [
    new webpack.HotModuleReplacementPlugin(),
  ];
  const output = {
    path: cwd(dest),
    filename: assetEntries.js[env],
    publicPath,
  };
  const prodPlugins = [];

  // pass the --quick flag to skip uglify/minifiy
  if (!quick) {
    prodPlugins.push(...[
      new webpack.optimize.UglifyJsPlugin({
        output: {
          comments: false,
        },
        compress: {
          warnings: false,
        },
        sourceMap: true,
      }),
      new webpack.LoaderOptionsPlugin({
        sourceMap: true,
        minimize: true,
        discardComments: {
          removeAll: true,
        },
      }),
    ]);
  }

  const plugins = [
    new webpack.DefinePlugin(
      defineEnv({target: `client`, config})
    ),
    new ExtractTextPlugin({
      filename: assetEntries.css[env],
      allChunks: true,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: ``,
        output,
        // Additional plugins for CSS post processing using postcss-loader
        postcss: [
          require(`stylelint`),
          // Allow importing of css from assets folder. note that versions > 7 break with babel-loader (related: https://github.com/babel/babel-loader/issues/242)
          require(`postcss-import`)({
            path: `src/assets/css/`,
          }),
          require(`postcss-custom-properties`),
          require(`postcss-calc`),
          require(`postcss-custom-media`),
          require(`postcss-nested`),
          require(`autoprefixer`),
          require(`postcss-discard-comments`),
          require(`postcss-discard-empty`),
        ],
      },
    }),
    generateStats(config),
  ];
  const hotEntry = `webpack-hot-middleware/client?${hmrOpts.join(`&`)}`;
  const entry = [
    `./${src}/${js}`,
  ];
  let devtool, styleLoaders;

  if (isDev) {
    plugins.push(...devPlugins);
    entry.unshift(hotEntry);
    devtool = `inline-source-map`;
    styleLoaders = devStyleLoaders;
  } else {
    plugins.push(...prodPlugins);
    devtool = `cheap-module-source-map`;
    styleLoaders = prodStyleLoaders;
  }

  if (stats) {
    plugins.push(
      new StatsWriterPlugin({
        transform(data, opts) {
          const stats = opts.compiler.getStats().toJson({chunkModules: true});

          return JSON.stringify(stats, null, 2);
        },
      })
    );
  }

  const loaders = [
    {
      test: /\.jsx?$/,
      enforce: `pre`,
      loader: `eslint-loader`,
    },
    babelLoader({env}),
    ...styleLoaders,
    {
      test: /\.svg$/,
      loader: `file-loader`,
    },
  ];

  return {
    devtool,
    entry: {
      main: entry,
    },
    output,
    resolve: {
      extensions: [ `.js`, `.jsx`, `.css` ],
      alias: {
        helpers: cwd(src, `assets`, `css`, `helpers`),
      },
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
    node: {
      fs: `empty`,
      __dirname: false,
    },
  };
}
