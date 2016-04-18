
module.exports = {
  paths: ['node_modules/lucify-commons'],
  publishFromFolder: 'dist',
  assetContext: 'vnk-asylum-countries/',

  bucket: (env) => {
    if (env == 'development') {
      return 'lucify-protected';
    }
  },
  baseUrl: (env) => {
    if (env == 'development') {
      return 'https://protected.lucify.com/';
    }
  }
};
