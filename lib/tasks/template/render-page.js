import {join} from 'path';
import {log} from 'gulp-util';
import nunjucks from 'nunjucks';
import req from 'require-dir';
import jsdom from 'jsdom';
import Helm from 'react-helmet';
import renderIsomorphic from './render-isomorphic';

/**
 * Setup all the isomorphic polyfills and nunjucks instance
 * @param {Object} config task config
 * @return {Function} async function to render page
 */
export default function(config) {
  const {
    src,
    entry: {templates},
    env,
    cwd,
    helmet,
  } = config;
  const doc = jsdom.jsdom(`<!doctype html><html><body></body></html>`);
  const win = doc.defaultView;

  if (!global.document) global.document = doc;
  if (!global.window) global.window = win;
  if (!global.navigator) global.navigator = win.navigator;

  const nunj = nunjucks.configure({
    watch: false,
    noCache: true,
  });
  const tags = req(join(__dirname, `tags`));
  const templatePath = cwd(src, templates);
  const globals = {
    layouts(...args) {
      return join(templatePath, `layouts`, ...args) + `.html`;
    },
    env,
    cwd,
    join,
    config,
  };

  Object.keys(globals).forEach(name => {
    nunj.addGlobal(name, globals[name]);
  });

  Object.keys(tags).forEach(name => {
    nunj.addExtension(name, new tags[name]());
  });

  /**
   * Create redux store and create HTML from nunjucks
   * @param {String} route route from manifest
   * @param {Function} routes isomorphic routes function taking the store
   * @param {Function} bootstrap isomorphic bootstrap function setting up redux
   * @return {Promise} promise resolving html and the context
   */
  return async ({route, routes, bootstrap}) => {
    const ctx = {
      title: route,
      route,
    };
    const {store} = bootstrap({env: `server`, route});
    let head, page;

    try {
      // render HTML directly this is necessary for react-helmet because
      // the Helmet component must be instantiated before calling `rewind`
      const data = await renderIsomorphic({
        routes,
        route,
        store,
      });

      if (helmet) {
        // IMPORTANT: this has to come after the renderToString Call
        // then you can use it in your templates
        // ex.
        // {{helmet.link | safe}}
        // https://github.com/nfl/react-helmet#server-usage
        head = Helm.rewind();
      }

      Object.assign(ctx, {
        helmet: head,
        store,
        __STORE__: store.getState(),
        ...data,
      });

      page = nunj.render(
        join(templatePath, `pages`, `index.html`),
        ctx
      );
    } catch (err) {
      log(err, err.message, err.stack);
      throw err;
    }

    return {
      ctx,
      page,
    };
  };
}
