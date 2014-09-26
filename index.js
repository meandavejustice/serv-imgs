var http = require("http");
var st = require("st");
var Router = require("routes-router");
var ls = require('ls-stream');
var sendHtml = require("send-data/html")
var mime = require('mime');
var path = require('path');
var app = Router()

module.exports = function() {

  function getHtml(cb) {
    var body = '<!DOCTYPE html><head><style>.preview{display: inline-block;padding: 20px;' +
      'border:1px solid black; margin: 10px;} img{max-width: 300px; max-height: 300px;} ' +
      'body{max-width: 1500px;}</style></head><html><body>';

    var previousDir;

    ls('./')
    .on('data', function(data) {
      if (!!~mime.lookup(data.path).indexOf('image')) {
        var directory = data.path.split('/');
        directory.pop();
        directory = directory.join('/');

        directory = directory === '' ? '/' : directory;

        if (directory !== previousDir) {
          body += '<br><a href="/' + directory + '"><h2>' + directory + '</h2></a><hr></br>';
        }

        body += '<a class="preview" href="/' + data.path + '"title="' + data.path +
          '"><img src="/' + data.path + '"/><br>' + data.path + '</a>';

        previousDir = directory;
      };
    })

    .on('end', function() {
      body += '</body></html>';
      cb(body);
    })
  }

  function handleReq(req, res) {
    getHtml(function(body) {
      sendHtml(req, res, {
        body: body,
        statusCode: 200,
        headers: {}
      });
    });
  }

  app.addRoute("/all-imgs", handleReq);
  app.addRoute("*", st('./'));

  var server = http.createServer(app);
  server.listen(0);

  console.log("Static/image-preview server listening on port", server.address().port);
}