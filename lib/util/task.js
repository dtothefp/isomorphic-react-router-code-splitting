import gutil from 'gulp-util';

const {colors} = gutil;
const {blue, magenta} = colors;
const log = str => !global.describe && process.stdout.write(str);
let called = false;

/**
 * Task runner function alternative to Gulp, simplifies sequencing tasks
 * https://medium.com/@tarkus/build-automation-with-vanilla-javascript-74639ec98bad#.vcr6ukb83
 * @param {String} task the name of the task
 * @param {Function} action the task function
 * @return {Promise} chainable Promise allowing action after all tasks complete
 */
function run(task, action, ...args) { // eslint-disable-line func-style
  const start = new Date();
  const {target} = args.find(({target: t}) => !!t) || {};
  let taskName = task;

  if (target) {
    taskName += `:${target}`;
  }

  taskName = blue(`[${taskName}]`);
  log(`Starting ${taskName}...\n`);
  called = true;

  return Promise.resolve().then(() => action(...args)).then(() => {
    const time = magenta(`${new Date().getTime() - start.getTime()}ms`);
    log(`Finished ${taskName} after ${time}\n`);
  }).catch(err => {
    process.stderr.write(`${err.message}\n${err.stack}\n`);
    throw err;
  });
}

// HACK: top level task calls itself if it is "exported"
process.nextTick(() => {
  if (called) return;

  try {
    require.main.exports();
  } catch (err) {
    const [child] = require.main.children.slice(-1);

    typeof child.exports === `function` && child.exports();
  }
});

export default (task, action) => run.bind(undefined, task, action);
