import path from 'path';
import config from './util/config';
import registerTasks from './util/register-tasks';
import task from './util/task';
import watcher from './util/watcher';

const {
  env,
  argv,
} = config;
const tasks = registerTasks({
  tasks: path.join(__dirname, `tasks`),
  config,
});
const len = argv.length;
let runner;

// TODO: split name string for target arguments
if (len) {
  runner = task(`spa-build-custom`, async () => {
    for (const name of argv) {
      const [ taskName, target ] = name.indexOf(`:`) !== -1 && name.split(`:`) || [name];

      await tasks[taskName]({target});
    }
  });
} else if (env === `development`) {
  runner = task(`spa-build-dev`, async () => {
    await tasks.clean();
    await tasks.copy();
    await tasks.webpack({target: `client`});
    await tasks.webpack({target: `server`});
    // await tasks.template();
    await tasks.server();
  });
} else if (env === `production`) {
  runner = task(`spa-build-prod`, async () => {
    await tasks.clean();
    await tasks.copy();
    await tasks.webpack({target: `client`});
    await tasks.webpack({target: `server`});
    // if running a local isomorphic build start the api server
    if (!process.env.TRAVIS_BRANCH) {
      await tasks.server({target: `api`});
    }
    await tasks.template();
  });
}

// bubble up error and kill the build
runner()
  .then(watcher({config, tasks}))
  .catch(() => process.exit(1));
