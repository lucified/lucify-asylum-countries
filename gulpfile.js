
var gulp = require('gulp');
var opts = require('./lucify-opts');
var prepareEmbedCodes = require('./src/scripts/prepare-embed-codes.js');

gulp.task('custom-embed-codes', prepareEmbedCodes);

opts.pretasks = ['custom-embed-codes'];

var builder = require('lucify-component-builder');
builder(gulp, opts);
