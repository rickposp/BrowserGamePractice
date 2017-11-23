var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');

var tsProject = ts.createProject("tsconfig.json");

dist_folder = './dist'

//Delete the dist directory
gulp.task('clean', function() {
	return gulp.src(dist_folder)
	.pipe(clean());
});

//Process scripts and concatenate them into one output file
gulp.task('scripts', ['compile'], function() {
	 gulp.src(["node_modules/mainloop.js/build/mainloop.min.js", "library/*.js", 'app.js'])
	 .pipe(concat('app.min.js'))
	 .pipe(gulp.dest(dist_folder));
});

gulp.task('css', ['clean'], function() {
    gulp.src('./styles.css')
    .pipe(gulp.dest(dist_folder));
});

gulp.task('html', ['clean'], function() {
    gulp.src('./index.html')
    .pipe(gulp.dest(dist_folder));
});

gulp.task("compile", ['clean'], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(dist_folder));
});

// Static server
// passing in an empty function to the init function to appease the error message
gulp.task('serve', ['scripts', 'css', 'html'], function() {
    browserSync.init({
        server: {
            baseDir: dist_folder
        }
    },
    function() {});
    gulp.watch(['app.js', 'index.html', 'main.ts', 'styles.css'], ['serve'])
    	.on('change', browserSync.reload);
});

gulp.task('default', ['scripts', 'html', 'css'])