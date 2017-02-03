import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';

/**
 * Use webpack-isomorphic-tools to generate webpack stats
 * and return the Plugin
 * @param {Object} config global task config
 * @return {Object} isomorphic-tools webpack plugin
 */
export default function(config) {
  const {
    env,
    dest,
    cwd,
    statsFile,
  } = config;
  const isDev = env === `development`;
  const statsFileFp = cwd(dest, statsFile);
  const toolsConfig = {
    debug: false,
    webpack_assets_file_path: statsFileFp, // eslint-disable-line camelcase
    assets: {
      images: {
        extensions: [
          `jpeg`,
          `jpg`,
          `png`,
          `gif`,
          `svg`,
        ],
        parser: WebpackIsomorphicToolsPlugin.url_loader_parser,
      },
      styles: {
        extensions: [`css`],
        filter(module, regex, options, log) {
          if (options.development) {
            return WebpackIsomorphicToolsPlugin.style_loader_filter(module, regex, options, log);
          }

          return regex.test(module.name);
        },
        path(module, options, log) {
          if (options.development) {
            return WebpackIsomorphicToolsPlugin.style_loader_path_extractor(module, options, log);
          }

          return module.name;
        },
        parser(module, options, log) {
          if (options.development) {
            return WebpackIsomorphicToolsPlugin.css_modules_loader_parser(module, options, log);
          }

          return module.source;
        },
      },
    },
  };

  return new WebpackIsomorphicToolsPlugin(toolsConfig).development(isDev);
}
