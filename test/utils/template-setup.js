/* eslint-disable */

/**
 * Taken from: https://github.com/mozilla/nunjucks/blob/master/tests/util.js
 * test examples for tags at: https://github.com/mozilla/nunjucks/blob/master/tests/compiler.j://github.com/mozilla/nunjucks/blob/master/tests/compiler.js
 */
import {Environment, Template} from 'nunjucks/src/environment';
import {FileSystemLoader as Loader} from 'nunjucks/src/node-loaders';

const templatesPath = `tests/templates`;

function normEOL(str) {
  if (!str) return str;

  return str.replace(/\r\n|\r/g, `\n`);
}

function render(str, ctx, opts, env) {
  if (typeof ctx === `function`) {
    ctx = null;
    opts = null;
    env = null;
  }
  else if (typeof opts === `function`) {
    opts = null;
    env = null;
  }
  else if (typeof env === `function`) {
    env = null;
  }

  opts = opts || {};
  opts.dev = true;
  const e = env || new Environment(new Loader(templatesPath), opts);
  let name;

  if (opts.filters) {
    for (name in opts.filters) {
      e.addFilter(name, opts.filters[name]);
    }
  }

  if (opts.asyncFilters) {
    for (name in opts.asyncFilters) {
      e.addFilter(name, opts.asyncFilters[name], true);
    }
  }

  if (opts.extensions) {
    for (name in opts.extensions) {
      e.addExtension(name, opts.extensions[name]);
    }
  }

  ctx = ctx || {};
  const t = new Template(str, e);

  return t.render(ctx);
}

export default render;
