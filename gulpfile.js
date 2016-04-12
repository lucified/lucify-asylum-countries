
var gulp = require('gulp');

var opts = {
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

var builder = require('lucify-component-builder');
builder(gulp, opts);
