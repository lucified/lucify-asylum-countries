
var gulp = require('gulp');

var opts = {
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist',
	assetContext: 'vnk-asylum-countries/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);
