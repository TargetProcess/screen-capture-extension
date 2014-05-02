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
var httpProxy = require('http-proxy');

var locals = {
    env: 'dev'
};

gulp.task('html', function() {

    return gulp.src('src/*.jade')
        .pipe(gp.plumber())
        .pipe(gp.jade({
            pretty: false,
            locals: locals
        }))
        .pipe(gp.inject(gp.bowerFiles({
            read: false
        }), {
            ignorePath: 'dist/',
            addRootSlash: false
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

gulp.task('js', function() {

    return gulp.src('src/scripts/**/*.js')
        .pipe(gulp.dest('dist/scripts'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('jsx', function() {
    return gulp.src('src/scripts/**/*.jsx')
        .pipe(gp.plumber())
        .pipe(gp.react())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(gp.lr());
});

gulp.task('manifest', function() {

    return gulp.src('src/manifest.json')
        .pipe(gulp.dest('dist'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('images', function() {

    return gulp.src('src/img/**.*')
        .pipe(gulp.dest('dist/img'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('sprites', function() {

    return gulp.src('src/icons/*.png')
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

    var apiProxy = httpProxy.createProxyServer();

    app.all('/targetprocess/*', function(req, res) {
        apiProxy.web(req, res, {
            target: 'http://shitkin:80'
        });
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
        // gulp.watch('src/*.jade', ['html']);
        // gulp.watch('*.html', ['html']);
        gulp.watch('src/scripts/**/*.js', ['js']);
        gulp.watch('src/scripts/**/*.jsx', ['jsx']);
        gulp.watch('src/manifest.json', ['manifest']);
    });
});

gulp.task('build', ['html', 'css', 'sprites', 'jsx', 'js', 'manifest', 'images']);
gulp.task('default', ['build', 'server', 'watch']);
