import chokidar from 'chokidar';

/**
 * Setup file watcher
 * @param {Object} config task config
 * @param {Object} tasks all exported functions from the `tasks` directory
 * @return {undefined}
 */
export default function({config, tasks}) {
  const {
    copy,
    env,
    argv,
  } = config;
  const len = argv.length;

  return () => {
    if (env === `development` && !len) {
      if (copy) {
        const watcherCopy = chokidar.watch(copy, {
          persistent: true,
        });

        watcherCopy.on(`change`, () => {
          tasks.copy();
        });
      }
    }
  };
}
