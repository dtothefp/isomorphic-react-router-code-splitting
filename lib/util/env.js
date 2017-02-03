import isEmpty from 'lodash/isEmpty';

/**
 * Add environmental config to `process.env` based upon the $NODE_ENV
 * and $TRAVIS_BRANCH
 * @param {Object} config global task config
 * @return {Object} loads environmental variables on `process.env`
 */
export default function(config) {
  const {
    env,
    hotPort,
    apiPort,
  } = config;
  const {TRAVIS_BRANCH} = process.env;
  const trimSlash = str => {
    return str.slice(-1) === `/` ? str.slice(0, str.length - 1) : str;
  };
  const addBranchToPath = fp => {
    const rootBranches = [
      `master`,
      `devel`,
    ];
    const shouldOmitBranch = rootBranches.includes(TRAVIS_BRANCH) || isEmpty(TRAVIS_BRANCH);
    const branch = shouldOmitBranch ? `` : `/${trimSlash(TRAVIS_BRANCH)}`;

    return fp + branch;
  };
  const envVars = {
    // path to prefix requests for translations, etc...
    API_STATIC: {
      local: `http://localhost:${apiPort}`,
      dev: addBranchToPath(`https://casper-staging.com`),
      prod: `https://casper-staging.com`,
    },
    // path to prefix asset requests in HTML
    PUBLIC_PATH: {
      local: env === `development` ? `http://localhost:${hotPort}/` : `/`,
      dev: addBranchToPath(`https://casper-staging.com`) + `/`,
      prod: `https://casper-staging.com/`,
    },
    // path to prefix api requests for product data
    API_DYNAMIC: {
      local: `https://spree.casper.com/japi`,
      dev: `https://spree.casper.com/japi`,
      prod: `https://spree.casper.com/japi`,
    },
  };

  return Object.keys(envVars).reduce((acc, name) => {
    let envKey;

    if (TRAVIS_BRANCH === `master`) {
      envKey = `prod`;
    } else if (TRAVIS_BRANCH) {
      envKey = `dev`;
    } else {
      envKey = `local`;
    }

    process.env[name] = acc[name] = envVars[name][envKey];

    return acc;
  }, {});
}

