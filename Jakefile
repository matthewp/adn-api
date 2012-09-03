var fs = require('fs'),
    spawn = require('child_process').spawn;

var outFile = 'adn.js',
    minFile = 'adn.min.js';

var UGLIFYJS = require('os').platform().indexOf('win') !== -1
  ? 'uglifyjs.cmd'
  : 'uglifyjs';

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
  "src/hashtag.js"
];

desc('Default, combine all files')
task('adn', [], function() {

  var data = "";

  files.forEach(function(file) {
    data += "\r";
    data += fs.readFileSync(file);
  });

  fs.writeFileSync(outFile, data);
});

task('min', [], function() {

  var ugjs = spawn(UGLIFYJS, [ '-nc', '-o',
    minFile, outFile]);

  var log = function(d) {
    console.log('' + d);
  };

  ugjs.stdout.on('data', log);
  ugjs.stderr.on('data', log);
  ugjs.on('exit', complete);

}, { async: true });

desc('Default task');
task('default', function() {
  jake.Task['adn'].invoke();
  jake.Task['min'].invoke();
});
