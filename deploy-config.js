
const lucifyDeployConfig = require('lucify-deploy-config').default; // eslint-disable-line

const opts = {
  publicPath: (env) => {
    if (env === 'production' || env === 'staging') {
      return '/embed/lucify-asylum-countries/';
    }
    return null;
  },
};

module.exports = lucifyDeployConfig(null, opts);
