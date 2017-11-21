var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');

//Static server
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(['*.html', '*.js', '*.css']).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);