import fs from 'fs-extra';
import glob from 'globby';

/**
 * Task for copying to dist directory specified from `config`
 * @param {Object} config global task config
 * @return {Function} task function
 */
export default function({config}) {
  const {
    copy,
    cwd,
    src,
    dest,
  } = config;

  return () => {
    if (!copy) return Promise.resolve();

    const files = glob.sync(copy, {cwd: cwd(src)});

    return Promise.all(files.map(file => {
      return new Promise((res, rej) => {
        fs.copy(cwd(src, file), cwd(dest, file), (err) => {
          if (err) return rej(err);

          res();
        });
      });
    }));
  };
}
