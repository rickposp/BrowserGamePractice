var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jest = require('gulp-jest').default;

var tsProject = ts.createProject("tsconfig.json");

dist_folder = './dist';
dist_scripts = dist_folder + '/scripts';
src_scripts = './scripts';

code_processing_tasks = ['html', 'css', "images", 'main_scripts'];

//Delete the dist directory
gulp.task('clean', function() {
	return gulp.src(dist_folder)
	.pipe(clean());
});

gulp.task('images', ['clean'], function() {
	return gulp.src("img/*.png")
	.pipe(gulp.dest(dist_folder));
});

gulp.task('main_scripts', ['clean'], function(){
	return gulp.src(["scripts/**/*"])
	.pipe(gulp.dest(dist_scripts));
})

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

gulp.task('browser_reload', code_processing_tasks, function(done){
	browserSync.reload();
	done();
});

// Static server
// passing in an empty function to the init function to appease the error message
gulp.task('serve', code_processing_tasks, function() {
    browserSync.init({
        server: {
            baseDir: dist_folder
        }
    },
    function() {});
    gulp.watch([src_scripts + '/**/*', 'index.html', 'styles.css'], ['browser_reload'])
});

gulp.task('default', code_processing_tasks)