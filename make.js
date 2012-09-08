require('shelljs/make');

var files = [
  "src/namespace.js",
  "src/xhr.js",
  "src/authentication.js",
  "src/endpoint.js",
  "src/api_access.js",
  "src/stream.js",
  "src/feed_stream.js",
  "src/mention_stream.js",
  "src/global_stream.js",
  "src/user_stream.js",
  "src/user.js",
  "src/post.js",
  "src/replies.js",
  "src/hashtag.js",
  "src/geolocation.js"
];

var outFile = 'adn.js';
var minFile = 'adn.min.js';

target.all = function() {
  target.bundle();
  target.minify();
};

target.bundle = function() {
  cat(files).to(outFile);
};

target.minify = function() {
  var uglifyjs = which('uglifyjs');
  var opts = [uglifyjs, '-nc', '-o', minFile, outFile];
  var cmd = opts.join(' ');
  exec(cmd);
};