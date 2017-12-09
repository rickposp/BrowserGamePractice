var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');

import plugin from 'gulp-jest-cli';

let dist_folder = './dist';
let dist_scripts = dist_folder + '/scripts';
let src_scripts = './scripts';
let src_specs = src_scripts + '/spec';

let code_processing_tasks = ['html', 'css', "images", 'main_script', 'libraries', 'modules'];

//Delete the dist directory
gulp.task('clean', function() {
	return gulp.src(dist_folder)
	.pipe(clean());
});

gulp.task('images', ['clean'], function() {
	return gulp.src("img/*.png")
	.pipe(gulp.dest(dist_folder + "/img/"));
});

gulp.task('main_script', ['clean'], function(){
	return gulp.src(src_scripts + "/main.js")
	.pipe(gulp.dest(dist_scripts));
})

gulp.task('libraries', ['clean'], function(){
	return gulp.src(src_scripts + "/library/*.js")
	.pipe(gulp.dest(dist_scripts + "/library" ));
})


gulp.task('modules', ['clean'], function(){
	return gulp.src(src_scripts + "/modules/*.js")
	.pipe(gulp.dest(dist_scripts + "/modules"));
});

gulp.task('css', ['clean'], function() {
    return gulp.src('./styles.css')
    .pipe(gulp.dest(dist_folder));
});

gulp.task('html', ['clean'], function() {
    return gulp.src('./index.html')
    .pipe(gulp.dest(dist_folder));
});

gulp.task('browser_reload', code_processing_tasks, function(done){
	browserSync.reload();
	done();
});

gulp.task('test', () => gulp
  .src(src_specs)
  .pipe(plugin({
    coverage: true,
    onlyChanged: true,
  }))
);

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