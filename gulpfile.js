'use strict';

//- PROJECT --------------------------------------------------------------------
const fs = require('fs');
const project = JSON.parse(fs.readFileSync('./package.json'));

//- IMPORTS --------------------------------------------------------------------
const {src, dest, series, parallel, watch} = require('gulp');

const del           = require('del'),
      gulpPug       = require('gulp-pug'),
      gulpSass      = require('gulp-sass'),
      autoprefixer  = require('gulp-autoprefixer'),
      sourcemaps    = require('gulp-sourcemaps'),
      htmlmin       = require('gulp-htmlmin'),
      cssnano      = require('gulp-cssnano'),
      uglify        = require('gulp-uglify'),
      imagemin      = require('gulp-imagemin'),
      pngquant      = require('imagemin-pngquant'),
	  gulpCache     = require('gulp-cache'),
      previewBS     = require('browser-sync').create('preview'),
      buildBS       = require('browser-sync').create('build');

//- BROWSER-SYNC SETTING -------------------------------------------------------
const previewSettingsBS = {
        'proxy':    '',
        'baseDir':  'preview/',
        'port':     8000,
        'UIport':   8001
    },
    buildSettingsBS = {
        'proxy':    '',
        'baseDir':  'build/',
        'port':     9000,
        'UIport':   9001
    };

//- VARIABLES ------------------------------------------------------------------
const look = {
        'php':      'src/**/*.php',
        'html':     'src/**/*.html',
        'pug':      'src/**/*.pug',
        'js':       'src/js/**/*.js',
        'sass':     'src/sass/**/*.sass',
        'css':      'src/**/*.css'
    },
    take = {
        'all':      'src/**/*.*',
        'php':      'src/**/*.php',
        'html':     'src/**/*.html',
        'pug':      'src/**/*.pug',
        'js':       'src/js/**/*.js',
        'sass':     'src/sass/**/*.sass',
        'css':      'src/css/**/*.css',
        'img':      'src/img/**/*.*',
        'stuff':    [
                    'src/**/*.*',
                '!src/sass/**',
                '!src/PUG-includes/**',
                '!src/img/**',
                '!src/js/**',
                '!src/*.html',
                '!src/*.pug',
                '!src/*.jpg',
                    'src/*.ico'
        ]
    },
    put = {
        'all':      'preview/',
        'php':      'preview/',
        'html':     'preview/',
        'pug':      'preview/',
        'css':      'preview/css/',
        'js':       'preview/js/',
        'img':      'preview/img/',
        'stuff':    'preview/'
    },
    build = {
        'all':      'build/',
        'php':      'build/',
        'html':     'build/',
        'pug':      'build/',
        'css':      'build/css/',
        'js':       'build/js/',
        'img':      'build/img/',
        'stuff':    'build/'
    },
    except = {
        'src': {
            'templates':[
                '!src/PUG-includes',
                '!src/PUG-includes/**/*'
            ],
            'sass': '!src/sass/**/*',
            'pug':  '!src/*.pug'
        },
        'preview': {
            'img': [
                '!preview/img',
                '!preview/img/**/*',
                '!preview/*.jpg',
                '!preview/*.png',
                '!preview/*.ico'
            ],
            'fonts': [
                '!preview/fonts',
                '!preview/fonts/**/*'
            ],
            'stuff': [
                '!preview/lib/',
                '!preview/lib/**/*'
            ]
        }
    },
    del_dir = {
        'preview':  'preview/**',
        'build':    'build/**'
    };

//- PREVIEW --------------------------------------------------------------------
const BS_preview = () => {
    if (previewSettingsBS.proxy) {
		previewBS.init({
			proxy: previewSettingsBS.proxy,
			watchOptions : {
					ignored : 'node_modules/*',
					ignoreInitial : true
				},
			tunnel: true,
			notify: false,
			port: previewSettingsBS.port,
			ui: {
				port: previewSettingsBS.UIport
			},
			logPrefix: project.name + ' | ' + project.version + ' | preview'
		});
	} else {
        previewBS.init({
			server: {
				baseDir: previewSettingsBS.baseDir
			},
			notify: false,
			port: previewSettingsBS.port,
			ui: {
				port: previewSettingsBS.UIport
			},
			logPrefix: project.name + ' | ' + project.version + ' | preview'
		});
	}
};

const php = () => {
    return src(take.php)
           .pipe(dest(put.php))
           .pipe(previewBS.stream());
};

const html = () => {
    return src(take.html)
           .pipe(dest(put.html))
           .pipe(previewBS.stream());
};

const pug = () => {
    return src([take.pug, ...except.src.templates])
           .pipe(gulpPug({
              pretty: '	'
           }))
           .pipe(dest(put.pug))
           .pipe(previewBS.stream());
};

const sass = () => {
    return src(take.sass)
		.pipe(sourcemaps.init())
		.pipe(gulpSass({indentType: 'tab', indentWidth: 1}).on('error', gulpSass.logError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(sourcemaps.write())
		.pipe(dest(put.css))
		.pipe(previewBS.stream());
};

const js = () => {
    return src(take.js)
           .pipe(dest(put.js))
           .pipe(previewBS.stream());
};

const img = () => {
    return src(take.img)
           .pipe(dest(put.img));
};

const stuff = () => {
    return src(take.stuff)
           .pipe(dest(put.stuff));
};

const del_preview = () => {
    return del([del_dir.preview], {force:true});
};

watch(look.pug, pug);
watch(look.html, html);
watch(look.php, php);
watch(look.sass, sass);
watch(look.js, js);

//- BUILD ----------------------------------------------------------------------

const BS_build = () => {
    if (buildSettingsBS.proxy) {
		buildBS.init({
			proxy: buildSettingsBS.proxy,
			watchOptions : {
					ignored : 'node_modules/*',
					ignoreInitial : true
				},
			tunnel: true,
			notify: false,
			port: buildSettingsBS.port,
			ui: {
				port: buildSettingsBS.UIport
			},
			logPrefix: project.name + ' | ' + project.version + ' | build'
		});
	} else {
        buildBS.init({
			server: {
				baseDir: buildSettingsBS.baseDir
			},
			notify: false,
			port: buildSettingsBS.port,
			ui: {
				port: buildSettingsBS.UIport
			},
			logPrefix: project.name + ' | ' + project.version + ' | build'
		});
	}
};

const php_build = () => {
    return src(take.php)
           .pipe(dest(build.php))
           .pipe(buildBS.stream());
};

const html_build = () => {
    return src(take.html)
           .pipe(htmlmin({collapseWhitespace: true}))
           .pipe(dest(build.html))
           .pipe(buildBS.stream());
};

const pug_build = () => {
    return src([take.pug, ...except.src.templates])
           .pipe(gulpPug())
           .pipe(htmlmin({collapseWhitespace: true}))
           .pipe(dest(build.pug))
           .pipe(buildBS.stream());
};

const sass_build = () => {
    return src(take.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(cssnano())
		.pipe(dest(build.css));
};

const js_build = () => {
    return src(take.js)
           .pipe(uglify())
           .pipe(dest(build.js))
           .pipe(buildBS.stream());
};

const stuff_build = () => {
    return src(take.stuff)
           .pipe(dest(build.stuff));
};

const del_build = () => {
    return del.sync([del_dir.build]);
};

const img_build = () => {
    return src(take.img)
           .pipe(cache(imagemin({
               progressive: true,
               svgoPlugins: [{removeViewBox: false}],
               use: [pngquant()],
               interlaced: true
           })))
           .pipe(dest(build.img));
};

// const watch_build = () => {
//     watch(look.pug, pug_build);
//     watch(look.html, html_build);
//     watch(look.php, php_build);
//     watch(look.sss, sss_build);
//     watch(look.js, js_build);
// };

//- DEV ------------------------------------------------------------------------
const _preview = series(del_preview, parallel(php, html, pug, sass, js, img, stuff), BS_preview);

const _build = series(del_build, parallel(php_build, html_build, pug_build, sass_build, js_build, img_build, stuff_build), BS_build);

exports.default     = series(_preview);
exports.preview     = series(_preview);
exports.build       = series(_build);
exports.pug         = series(pug);
exports.pug_build   = series(pug_build);
exports.sass        = series(sass);
exports.sass_build  = series(sass_build);