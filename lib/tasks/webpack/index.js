/* eslint require-jsdoc:0 */
import webpack from 'webpack';
import {log} from 'gulp-util';
import makeClientConfig from './client-config';
import makeServerConfig from './server-config'; // eslint-disable-line

/**
 * Task compiling client and server side JS and CSS
 * @param {Object} config global task config
 * @return {Function} task function
 */
export default function({config}) {
  const {
    env,
    dest,
    hotPort,
  } = config;

  return ({target = `client`}) => {
    return new Promise((res, rej) => {
      if (target === `client`) {
        const clientConfig = makeClientConfig(config);
        const compiler = webpack(clientConfig);

        // TODO: log eslint warnings/errors
        if (env === `development`) {
          // const WebpackDevServer = require(`webpack-dev-server`);
          const express = require(`express`);
          const devMiddleware = require(`webpack-dev-middleware`);
          const hotMiddleware = require(`webpack-hot-middleware`);
          const app = express();
          const serverOptions = {
            contentBase: dest,
            hot: true,
            inline: true,
            lazy: false,
            publicPath: clientConfig.output.publicPath,
            headers: {'Access-Control-Allow-Origin': `*`},
            stats: {colors: true},
          };
          let hasRun = false;

          app.use(devMiddleware(compiler, serverOptions));
          app.use(hotMiddleware(compiler));

          compiler.plugin(`done`, () => {
            if (!hasRun) {
              app.listen(hotPort, (err) => {
                if (err) {
                  log(err);
                  return rej(err);
                }
                log(`==> 🔥  Webpack development server listening on port %s`, hotPort);
                hasRun = true;
                res();
              });
            }
          });
        } else {
          compiler.run((err, stats) => {
            log(stats.toString());
            // resolve promise ending the task
            res();
          });
        }
      } else {
        const serverConfig = makeServerConfig(config);
        const compiler = webpack(serverConfig);

        if (env === `development`) {
          compiler.watch({
            aggregateTimeout: 300,
            poll: true,
          }, (err, stats) => {
            log(stats.toString());
            // resolve promise ending the task
            res();
          });
        } else {
          compiler.run((err, stats) => {
            log(stats.toString());
            // resolve promise ending the task
            res();
          });
        }
      }
    });
  };
}
