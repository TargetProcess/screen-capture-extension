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

gp.runSequence = require('run-sequence');
var rjs = require('requirejs');

var locals = {
    env: 'dev'
};

gulp.task('html', function() {

    var bowerFiles = gp.bowerFiles({
        read: false
    })
        .pipe(gp.filter('!requirejs/**'));

    return gulp.src('src/*.jade')
        .pipe(gp.plumber())
        .pipe(gp.jade({
            pretty: true,
            locals: locals
        }))
        .pipe(gp.inject(bowerFiles, {
            ignorePath: 'dist/',
            addRootSlash: false
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('html-release', function() {

    return gulp.src('dist/*.html')
        .pipe(gp.usemin({
            css: [gp.csso(), gp.rev()],
            js: [gp.uglify(), gp.rev()]
        }))
        .pipe(gulp.dest('release/'));
});

gulp.task('css', function() {

    return gulp.src('src/css/style.scss')
        .pipe(gp.plumber())
        .pipe(gp.rubySass({
            loadPath: ['dist/vendor/bootstrap-sass-official/vendor/assets/stylesheets'],
            // sourcemap: true
        }))
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

gulp.task('manifest-release', function() {

    return gulp.src('dist/manifest.json')
        .pipe(gulp.dest('release'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('images', function() {

    return gulp.src('src/img/**.*')
        .pipe(gulp.dest('dist/img'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('images-release', function() {

    return gulp.src('src/img/icon*.*')
        .pipe(gulp.dest('release/img'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('sprites', function() {

    return gulp.src('src/icons/*.svg').pipe(gp.svgmin([{
        removeEditorsNSData: {
            additionalNamespaces: ['http://www.bohemiancoding.com/sketch/ns']
        }
    }]))
        .pipe(gp.svgSprites.svg({
            className: '.icon-%f',
            cssFile: 'css/icons.css',
            svg: {
                sprite: 'icons/svg-sprite.svg'
            }
        }))
        .pipe(gp.filter('!**/*.html'))
        .pipe(gulp.dest('dist'))
        .pipe(gp.svgSprites.png());
});

gulp.task('sprites-release', function() {

    return gulp.src('dist/icons/*')
        .pipe(gulp.dest('release/icons'))
        .pipe(gp.lr())
        .pipe(gp.size());
});

gulp.task('clean-release', function() {
    return gulp.src('release')
        .pipe(gp.clean());
});

gulp.task('rjs', function(cb) {
    rjs.optimize({
        appDir: 'dist/scripts',
        baseUrl: '.',
        paths: {
            'Class': 'libs/class'
        },
        dir: 'release/scripts',
        modules: [
            // //First set up the common build layer.
            // {
            //     //module names are relative to baseUrl
            //     name: '../common',
            //     //List common dependencies here. Only need to list
            //     //top level dependencies, "include" will find
            //     //nested dependencies.
            //     include: [
            //         'jquery',
            //         'app/lib',
            //         'app/controller/Base',
            //         'app/model/Base'
            //     ]
            // },

            // //Now set up a build layer for each page, but exclude
            // //the common one. "exclude" will exclude nested
            // //the nested, built dependencies from "common". Any
            // //"exclude" that includes built modules should be
            // //listed before the build layer that wants to exclude it.
            // //"include" the appropriate "app/main*" module since by default
            // //it will not get added to the build since it is loaded by a nested
            // //require in the page*.js files.
            // {
            //     //module names are relative to baseUrl/paths config
            //     name: '../page1',
            //     include: ['app/main1'],
            //     exclude: ['../common']
            // },

            {
                //module names are relative to baseUrl
                name: 'main',
                include: ['../../dist/vendor/requirejs/require.js']
                // exclude: ['../common']
            }
        ]
    }, function() {
        // console.log('build response', buildResponse);
        cb();
    }, cb);
});

gulp.task('rjs-clean', function() {
    return gulp.src('release/scripts/!(main.js|background.js)', {
        read: false
    })
        .pipe(gp.clean());
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

    process.on('uncaughtException', function(err) {
        gp.util.log(err);
    });
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

gulp.task('release', function(next) {
    locals.env = 'prod';
    gp.runSequence(
        [
            'build', 'clean-release'
        ], [
            'html-release', 'manifest-release', 'images-release', 'sprites-release', 'rjs'
        ], [
            'rjs-clean'
        ],
        next
    );
});
