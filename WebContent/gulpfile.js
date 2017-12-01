var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jest = require('gulp-jest').default;

var tsProject = ts.createProject("tsconfig.json");

dist_folder = './dist'

//Delete the dist directory
gulp.task('clean', function() {
	return gulp.src(dist_folder)
	.pipe(clean());
});

gulp.task('images', ['clean'], function() {
	return gulp.src("img/*.png")
	.pipe(gulp.dest(dist_folder));
});

//Process scripts and concatenate them into one output file
gulp.task('scripts', function() {
	 return gulp.src(["node_modules/mainloop.js/build/mainloop.min.js", "library/*.js", 'app.js'])
	 .pipe(concat('app.min.js'))
	 .pipe(gulp.dest(dist_folder));
});

gulp.task('css', ['clean'], function() {
    return gulp.src('./styles.css')
    .pipe(gulp.dest(dist_folder));
});

gulp.task('html', ['clean'], function() {
    return gulp.src('./index.html')
    .pipe(gulp.dest(dist_folder));
});

gulp.task('jest', function () {
	  return gulp.src('app.test.js')
	  .pipe(jest({
	    "automock": false
	  }));
});

gulp.task('browser_reload', ['scripts', 'css', 'html', "images"], function(done){
	browserSync.reload();
	done();
});

// Static server
// passing in an empty function to the init function to appease the error message
gulp.task('serve', ['scripts', 'css', 'html', "images"], function() {
    browserSync.init({
        server: {
            baseDir: dist_folder
        }
    },
    function() {});
    gulp.watch(['app.js', 'index.html', 'styles.css'], ['browser_reload'])
});

gulp.task('default', ['scripts', 'html', 'css', "images"])