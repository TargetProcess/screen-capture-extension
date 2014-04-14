/*eslint-env node */
/*eslint no-global-strict: 0, no-console: 0 */
'use strict';

var path = require('path');

var gulp = require('gulp');
var gp = require('gulp-load-plugins')();

var livereload = require('tiny-lr')();
gp.lr = gp.livereload.bind(null, livereload);

var sprite = require('css-sprite').stream;

var express = require('express');

gulp.task('js', function() {

    return gulp.src('scripts/**/*.js')
        .pipe(gp.plumber())
        .pipe(gulp.dest('scripts'));
    // .pipe(gp.lr())
    // .pipe(gp.size())

});

gulp.task('html', function() {

    return gulp.src('src/*.jade')
        .pipe(gp.plumber())
        .pipe(gp.jade({
            pretty: false
        }))
        .pipe(gp.inject(gp.bowerFiles({
            read: false
        }), {
            ignorePath: 'dist/'
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('css', function() {

    return gulp.src('src/css/style.scss')
        .pipe(gp.plumber())
        .pipe(gp.rubySass())
        .pipe(gp.autoprefixer())
        .pipe(gulp.dest('dist/css'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

var spritesmith = require('gulp.spritesmith');

gulp.task('sprites', function() {

    // var spriteData = gulp.src('src/svg/edit.png').pipe(spritesmith({
    //     // engine: 'canvas',
    //     imgName: 'sprite.png',
    //     cssName: 'sprite.css'
    // }));
    // spriteData.img.pipe(gulp.dest('dist/css'));
    // spriteData.css.pipe(gulp.dest('dist/css'));

    return gulp.src('src/**/*.png')
        .pipe(sprite({
            base64: true,
            style: 'icons.css',
            processor: 'css'
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('server', function() {

    var app = express();

    app.configure(function() {
        app.use(express.errorHandler());
        app.use(express.static(path.resolve(__dirname, 'dist')));
    });

    app.listen(8080);
    gp.util.log('Started at http://0.0.0.0:8080');
});

gulp.task('watch', function() {
    livereload.listen(35729, function(err) {
        if (err) {
            return console.log(err);
        }
        gulp.watch('src/**/*.scss', ['css']);
        gulp.watch('src/*.jade', ['html']);
        // gulp.watch('*.html', ['html']);
        // gulp.watch('scripts/*.js', ['js']);
    });
});

gulp.task('build', ['html', 'css', 'sprites']);
gulp.task('default', ['build', 'server', 'watch']);
