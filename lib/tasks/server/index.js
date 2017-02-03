import apiServer from './api-server';
import webServer from './web-server';

/**
 * Task for starting local development server
 * @param {Object} config global task config
 * @return {Function} task function
 */
export default function({config}) {
  return (opts = {}) => {
    const {target} = opts;
    let ret;

    switch (target) {
      case `api`:
        ret = apiServer(config);
        break;
      case `web`:
        ret = webServer(config);
        break;
      default:
        ret = Promise.all([
          apiServer(config),
          webServer(config),
        ]);
        break;
    }

    return ret;
  };
}
