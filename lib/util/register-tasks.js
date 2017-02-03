import path from 'path';
import fs from 'fs';
import task from './task';
import camelCase from 'lodash/camelCase';

/**
 * Lazy load tasks object of keys = name and values = curried task function.
 * Pass in the global config and register the tasks.
 * @param {String} tasks filepath to tasks directory
 * @param {Object} config project config
 * @return {Object} registered tasks object
 *
 * ex. {
 *   [name]: task to be registered wrapped in anonymous function
 * }
 */
export default function({tasks, config}) {
  /**
   * Wrap registration of the task inside an anonymous function. Allows "lazy-loading"
   * of tasks.
   * @param {String} name task name ask key from reduced Object
   * @return {Function} wrapped task registration
   */
  const curryTaskFn = name => {
    return (...args) => {
      const wrapper = require(
        path.join(tasks, name)
      );
      const fn = wrapper({config});

      return task(name, fn)(...args);
    };
  };

  return fs.readdirSync(tasks).filter(dir => {
    return fs.statSync(path.join(tasks, dir)).isDirectory();
  }).reduce((acc, name) => ({
    ...acc,
    [camelCase(name)]: curryTaskFn(name),
  }), {});
}
