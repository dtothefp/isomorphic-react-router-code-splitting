import express from 'express';
import proxy from 'http-proxy-middleware';
import {log} from 'gulp-util';
import open from 'open';
import renderMiddleware from './render-middleware';

/* eslint require-jsdoc:0*/

/**
 * Create a Webserver with BrowserSync to serve static content from `dist`
 * @param {Object} config global task config
 * @return {Promise}
 */
export default function(config) {
  const {
    cwd,
    env,
    dest,
    devPort,
    hotPort,
  } = config;

  const app = express();

  app.use(
    proxy(`/*.hot-update.{json,js}`, {
      target: `http://localhost:${hotPort}`,
    })
  );

  app.use(express.static(cwd(dest)));

  if (env === `development`) {
    app.use(renderMiddleware(config));
  }

  return new Promise((res, rej) => {
    app.listen(devPort, (err) => {
      if (err) return rej(err);

      log(`==> 🍻  Web server listening on port %s`, devPort);
      open(`http://localhost:${devPort}/bleep`);
      res();
    });
  });
}
