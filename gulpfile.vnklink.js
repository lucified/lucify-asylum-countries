
var gulp = require('gulp');
const request = require('request');

var project = 'vnk-asylum-countries'

var path = `${project}`

var bucket = 'lucify-development'
var url = `http://${bucket}.s3-website-eu-west-1.amazonaws.com/${path}`

var opts = {
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist/',
	defaultBucket: bucket,
	maxAge: 3600,
	assetContext: path,
	baseUrl: 'http://www.lucify.com/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);

gulp.task('s3-deployandnotify', gulp.series('s3-deploy', notify))
console.log(path)
console.log(url)
function notify(cb) {
  
    var options = {
      url: 'https://api.flowdock.com/v1/messages/chat/' + process.env.FLOW_TOKEN,
      method: 'POST',
      json: true,
      body: {
        "external_user_name": "CircleCI",
        "content": `Deployed ${project} to ${url}`,
        "tags":  ["#deployment", `#${process.env.NODE_ENV || 'development'}`]
      }
    }
    
    
    request(options, (error, res, body) => {
      if(error) {
        console.log(error)
        return cb()
      }
      if(res.statusCode != 200) {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        console.log(`BODY: ${JSON.stringify(body)}`);
      }
      cb()
    });
}
