module.exports = function(grunt) {
  var outFile = 'adn.js',
      minFile = 'adn.min.js';

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

  grunt.initConfig({
    concat: {
      dist: {
        src: files,
        dest: outFile
      }
    },
    uglify: {
      dist: {
        files: {
          'adn.min.js': outFile
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
        options: {
          es5: true,
          eqnull: true,
          laxbreak: true,
          sub: true,
          globals: {
          }
        }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
