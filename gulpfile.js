
var gulp = require('gulp');
const request = require('request');

var project = process.env.PROJECT || 'vnk-asylum-countries'
var branch = process.env.BRANCH || 'master'

var path = `embed/${project}-${branch}`
path += process.env.COMMIT ? `-${process.env.COMMIT.substr(0, 7)}` : ''
path += "/"

var bucket = 'lucify-development'
var url = `http://${bucket}.s3-website-eu-west-1.amazonaws.com/${path}`
console.log(url)
var opts = {
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist',
	defaultBucket: bucket,
	maxAge: 3600,
	assetContext: path,
	baseUrl: 'http://www.lucify.com/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);

gulp.task('s3-deployandnotify', gulp.series('s3-deploy', notify))


function notify(cb) {
      
    var options = {
      url: `https://api.flowdock.com/v1/messages/team_inbox/${process.env.FLOW_TOKEN}`,
      method: 'POST',
      json: true,
      body: {
        "source": "CircleCI",
        "from_name": "Mr. Robot",
        "from_address": "info@lucify.com",
        "subject": `Deployed!`,
        "content": `See ${url}`,
        "project": project,
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
