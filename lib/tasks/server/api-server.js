import express from 'express';
import cors from 'cors';
import {log} from 'gulp-util';
import isPlainObject from 'lodash/isPlainObject';

/* eslint require-jsdoc:0*/

/**
 * Create an Api server with Express to serve files that will
 * be uploaded to S3
 * @param {Object} config global task config
 * @return {Promise}
 */
export default function(config) {
  const {
    cwd,
    dest,
    middleware,
    apiPort,
  } = config;

  const app = express();

  app.use(cors());
  app.use(express.static(cwd(dest)));

  if (isPlainObject(middleware)) {
    // add the middleware
    Object.keys(middleware).forEach((route) => {
      app.get(route, (req, res) => {
        res.sendFile(cwd(middleware[route]));
      });
    });
  }

  return new Promise((res, rej) => {
    app.listen(apiPort, (err) => {
      if (err) rej(err);

      log(`==> 🦄  Api server listening on port %s`, apiPort);
      res();
    });
  });
}
