
var HandleBars = require('handlebars');
var fs = require('fs');
var mkpath = require('mkpath');

var embedCode = require('lucify-commons/src/js/embed-code.js');
var deployOptions = require('lucify-component-builder/src/js/deploy-options.js');
var opts = require('../../lucify-opts.js');
var path = require('path');

function getEnv() {
  if(process.env.LUCIFY_ENV)
    return process.env.LUCIFY_ENV;
  if(process.env.NODE_ENV)
    return process.env.NODE_ENV;
  return 'test';
}

function prepareEmbedCodes(cb) {
  var currentDeployOptions = deployOptions(getEnv(), opts);
  var template = HandleBars.compile(fs.readFileSync('src/templates/embed-codes.hbs', 'utf8'));

  var embedBaseUrl = currentDeployOptions.baseUrl + currentDeployOptions.assetContext;
  var embedUrlEn = embedBaseUrl;
  var embedUrlFi = embedBaseUrl + '?fi';

  var data = {
    scriptTagEmbedCode: embedCode.getScriptTagEmbedCode(embedBaseUrl, embedUrlEn),
    iFrameWithRemoteResizeEmbedCode: embedCode.getIFrameEmbedCodeWithRemoteResize(embedBaseUrl, embedUrlEn),
    iFrameWithInlineResizeEmbedCode: embedCode.getIFrameEmbedCodeWithInlineResize(embedBaseUrl, embedUrlEn),
    scriptTagEmbedCodeFi: embedCode.getScriptTagEmbedCode(embedBaseUrl, embedUrlFi),
    iFrameWithRemoteResizeEmbedCodeFi: embedCode.getIFrameEmbedCodeWithRemoteResize(embedBaseUrl, embedUrlFi),
    iFrameWithInlineResizeEmbedCodeFi: embedCode.getIFrameEmbedCodeWithInlineResize(embedBaseUrl, embedUrlFi)
  };

  var result = template(data);
  var destPath = path.join('dist', currentDeployOptions.assetContext);

  mkpath.sync(destPath);
  fs.writeFileSync(path.join(
      destPath,
      'embed-codes-custom.html'), result);
  cb();
}


module.exports = prepareEmbedCodes;
