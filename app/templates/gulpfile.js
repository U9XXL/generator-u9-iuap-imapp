const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const stylish = require('jshint-stylish');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins({
    rename: {
        'gulp-angular-templatecache': 'templateCache'
    }
});
const reload = browserSync.reload;

var containSummer = true;

gulp.task('lint', () => {
    return gulp.src('app/js/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(stylish));
});

gulp.task('html', () => {
    var partialsInjectFile = gulp.src('.tmp/templates.js', { read: false });
    var partialsInjectOptions = {
        starttag: '<!-- inject:templates -->',
        ignorePath: '.tmp',
        addRootSlash: false
    };

    return gulp.src('app/*.html')
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe($.useref())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano({ safe: true, autoprefixer: false })))
        .pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true })))
        .pipe(gulp.dest('www'));
});

gulp.task('images', () => {
    return gulp.src('app/img/**/*')
        .pipe($.cache($.imagemin()))
        .pipe(gulp.dest('www/img'));
});

gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(err) {}))
        .pipe(gulp.dest('www/fonts'));
});

gulp.task('depimages', () => {
    return gulp.src(require('main-bower-files')('**/*.{png,jpg,jpeg,gif,webp}', function(err) {}))
        .pipe(gulp.dest('www/img'));
});

gulp.task('appfiles', () => {
    return gulp.src('app/**/*')
        .pipe(gulp.dest('www'));
});

gulp.task('bowerfiles', () => {
    return gulp.src(require('main-bower-files')('**/*'), {read: true, base: 'bower_components'})
        .pipe(gulp.dest('www/bower_components'));
});

// Angular template cache task
gulp.task('templatecache', () => {
    return gulp.src('app/tpls/**/*.html')
        .pipe($.templateCache('templates.js', {
            root: 'tpls/',
            module: '<%= appId %>'
        }))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'www', 'summer.zip']));

gulp.task('serve', () => {
    runSequence(['clean', 'wiredep', 'lint'], () => {
        browserSync.init({
            notify: false,
            port: 9019,
            server: {
                baseDir: ['app'],
                routes: {
                    '/bower_components': 'bower_components',
                    '/local': './local'
                }
            }
        });

        gulp.watch([
            'app/css/**/*.css',
            'app/js/**/*.js',
            'app/tpls/**/*.html',
            'app/*.html',
            'app/img/**/*'
        ]).on('change', reload);

        gulp.watch('app/js/**/*.js', ['lint']);
        gulp.watch('bower.json', ['wiredep']);
    });
});

gulp.task('serve:dist', () => {
    containSummer = false;
    runSequence('dist', function () {
        browserSync.init({
            notify: false,
            port: 9020,
            server: {
                baseDir: ['www']
            }
        });
    });
});

// inject bower components
gulp.task('wiredep', () => {
    gulp.src('app/*.html')
        .pipe(wiredep({
            exclude: ['bootstrap.js'],
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('wiredepdebug', () => {
    gulp.src('app/*.html')
        .pipe(wiredep({
            exclude: ['bootstrap.js'],
            ignorePath: /^(\.\.\/)*\.\.\//
        }))
        .pipe(gulp.dest('www'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'depimages'], () => {
    return gulp.src('www/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('summer', () => {
    return gulp.src('../summer.js').pipe(gulp.dest('www'));
});

gulp.task('zip', () => {
    return gulp.src(['www/**/*', 'app.json'], { base: './' })
        .pipe($.zip('summer.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', () => {
    return new Promise(resolve => {
        runSequence(['clean', 'wiredep'], ['bowerfiles', 'appfiles'], ['wiredepdebug', 'summer'], 'zip', resolve);
    });
});

gulp.task('dist', () => {
    return new Promise(resolve => {
        var batches = ['build'];
        if (containSummer) {
            batches.push('summer');
        }
        runSequence(['clean', 'wiredep', 'templatecache'], batches, 'zip', resolve);
    });
});
