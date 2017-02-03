import path from 'path';
import {log, colors} from 'gulp-util';
import merge from 'lodash/merge';
import loadEnv from './env';

const config = {
  configFile: `iso-build.config`,
  statsFile: `webpack-main-stats.json`,
  src: `src`,
  dest: `dist`,
  base: path.resolve.bind(path, __dirname, `..`, `..`),
  cwd: path.join.bind(path, process.cwd()),
  env: process.env.NODE_ENV || `development`,
  branch: process.env.TRAVIS_BRANCH,
  apiPort: `4000`,
  devPort: `8080`,
  hotPort: `9090`,
  defaultLocale: `en-US`,
  entry: {
    templates: `templates`,
    js: `main.js`,
    css: `base.css`,
    component: `routes`,
  },
};
const {cwd, configFile} = config;
const configFilePath = cwd(configFile);

// merge custom config from parent project with base config
try {
  const customConfig = require(configFilePath);
  log(`found custom config at ${colors.magenta(configFilePath)}`);

  merge(config, customConfig);
} catch (err) {
  log(`cannot find custom config at ${colors.blue(configFilePath)}`);
}

const envVars = loadEnv(config);

// cli options prefixed with --
const options = [
  `quick`,
  `stats`,
];
const argv = process.argv.slice(2).reduce((list, arg) => {
  const idx = options.indexOf(arg.replace(`--`, ``));

  if (idx !== -1) {
    Object.assign(config, {
      [options[idx]]: true,
    });
  } else {
    list.push(arg);
  }

  return list;
}, []);

export default Object.assign({}, config, {envVars, argv});
