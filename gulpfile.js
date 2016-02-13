var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var config = {
  jshintPath: '.jshintrc',
  js: {
    src: ['index.js', 'lib/**/*.js'],
    opt: {
      cwd: './'
    }
  }
};

gulp.task('js', function() {
  return gulp.src(config.js.src, config.js.opt)
    .pipe($.jshint(config.jshintPath))
    .pipe($.jshint.reporter('default'))
});

gulp.task('default', function() {
  gulp.start('js');
});