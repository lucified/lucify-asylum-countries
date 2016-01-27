
var gulp = require('gulp');

var path = (process.env.PROJECT || 'vnk-asylum-countries')
path += process.env.COMMIT ? '-' + process.env.COMMIT.substr(0, 7) : ''

var opts = {
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist',
	defaultBucket: 'lucify-dev',
	maxAge: 3600,
	assetContext: 'embed/'+path,
	baseUrl: 'http://www.lucify.com/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);
