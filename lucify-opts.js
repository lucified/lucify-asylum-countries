
module.exports = {
  paths: ['node_modules/lucify-commons'],
  publishFromFolder: 'dist',
  assetContext: process.env.MINARD ? '' : 'embed/lucify-asylum-countries/',
  pageDef: {
    title: 'Asylum seekers in Europe - Lucify'
  }
};
