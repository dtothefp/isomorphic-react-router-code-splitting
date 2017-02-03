const path = require('path');
const fs = require('fs-extra');
const config = {
  ignore: [
    /^.*\/dist\/.+\.jsx?$/,
    /^(.*?\/)?node_modules\/(?!sleep-spa-build\/).+\.jsx?$/
  ]
};

// HACK: to use `iron-node` debugger, it runs on version 5 so needs different
// compilation settings.
// ex.
// npm i -g iron-node@latest
// iron-node index.js # place a debugger in your code
if (/^v5\./.test(process.version)) {
  const babelrc = fs.readJsonSync(
    path.join(__dirname, `.babelrc`)
  );

  babelrc.presets[0] = `es2015`;
  Object.assign(config, babelrc);
  require('babel-polyfill');
}

require('babel-register')(config);
require('./lib');
