/**
 * Create an object of environmental variables to be defined in Webpack
 * @param {String} target server or client
 * @param {Object} config global config Object
 * @return {Object} DefinePlugin environmental variables
 */
export default function({target = `client`, config}) {
  const {envVars, env} = config;
  const {
    API_STATIC,
    API_DYNAMIC,
  } = envVars;
  const NODE_ENV = target === `client` ? env : `production`;
  const ISO_ENV = target;
  const {TRAVIS_BRANCH} = process.env;
  const baseEnv = {
    NODE_ENV: JSON.stringify(NODE_ENV),
    API_STATIC: JSON.stringify(API_STATIC),
    API_DYNAMIC: JSON.stringify(API_DYNAMIC),
    ISO_ENV: JSON.stringify(ISO_ENV),
  };

  if (TRAVIS_BRANCH) {
    Object.assign(baseEnv, {
      TRAVIS_BRANCH: JSON.stringify(TRAVIS_BRANCH),
    });
  }

  return {
    'process.env': baseEnv,
  };
}
