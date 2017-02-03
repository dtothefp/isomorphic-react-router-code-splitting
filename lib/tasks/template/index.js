import {outputFile} from 'fs-extra';
import {join} from 'path';
import {colors, log} from 'gulp-util';
import renderPage from './render-page';

/**
 * Task creating HTML templates
 * @param {Object} config global task config
 * @return {Function} task function
 */
export default function({config}) {
  const {blue, magenta} = colors;
  const render = renderPage(config);
  const {
    entry: {component},
    cwd,
    env,
    dest,
    isomorphic,
  } = config;

  /**
   * Read the `routes` Object so a manifest of routes to render
   * statically does not have to be duplicated in the `sleep-spa.build.js`
   * config file.
   *
   * @param {String} route the base route passed in to the function
   * @param {Array} children the child routes from react-router
   * @return {Array} array of routes
   */
  const recurseChildRoutes = (route, children = []) => {
    return children.reduce((list, {path: fp, childRoutes}) => {
      const fullRoute = join(route, fp);

      if (!/\/?[a-z]{2}\/[a-z]{2}$/.test(fullRoute)) {
        list.push(fullRoute);
      }

      if (Array.isArray(childRoutes)) {
        return [
          ...list,
          ...recurseChildRoutes(fullRoute, childRoutes),
        ];
      }

      return list;
    }, []);
  };

  return (opts = {}) => {
    const isoPaths = {
      bootstrap: require.resolve(cwd(dest, isomorphic.bootstrap)),
      routes: require.resolve(cwd(dest, component)),
    };

    const isoModules = Object.keys(isoPaths).reduce((acc, name) => {
      const fp = isoPaths[name];

      // for local dev make sure update modules are not cached
      if (require.cache[fp]) {
        delete require.cache[fp];
      }

      try {
        Object.assign(acc, {
          [name]: require(fp).default,
        });
      } catch (err) {
        log(blue(`[require-isomorphic-${name}]`) + `error requiring ${magenta(fp)}`);
      }

      return acc;
    }, {});

    /**
     * Weird race condition here, can't pass the store into the routes yet
     * because a new store needs to be created for every route. First we
     * must parse the routes with `recurseChildRoutes` and then in `prod`
     * iterate over them creating a new store each time.
     */
    const {path: fp, childRoutes} = isoModules.routes({}, {env: `server`});
    const routes = recurseChildRoutes(fp, childRoutes);
    const renderArgs = {
      ...isoModules,
      config,
    };

    if (env === `development`) {
      const {req} = opts;
      let {url} = req;

      // remove trailing slash
      if (url.lastIndexOf(`/`) === url.length - 1) {
        url = url.slice(0, -1);
      }

      if (!routes.includes(url)) return Promise.reject();

      return render(
        Object.assign({}, renderArgs, {route: url})
      );
    }

    const renderedRoutes = routes.map(route => {
      return render(
        Object.assign({}, renderArgs, {route})
      );
    });

    return Promise.all(renderedRoutes).then(results => {
      const written = results.map(({page, ctx}) => {
        return new Promise((res, rej) => {
          const writePath = cwd(dest, ctx.route, `index.html`);

          outputFile(writePath, page, err => {
            if (err) return rej(err);

            res();
          });
        });
      });

      return Promise.all(written);
    });
  };
}
