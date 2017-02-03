import del from 'del';

/**
 * Task for deleting dist directory specified from `config`
 * @param {Object} config global task config
 * @return {Function} task function
 */
export default function({config}) {
  const {cwd, dest} = config;

  return () => {
    return del(cwd(dest));
  };
}
