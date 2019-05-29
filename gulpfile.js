'use strict';

//- PROJECT --------------------------------------------------------------------
const fs = require('fs');
const project = JSON.parse(fs.readFileSync('./package.json'));

//- IMPORTS --------------------------------------------------------------------
const {src, dest, series, parallel, watch} = require('gulp');

const del           = require('del'),
      gulppug       = require('gulp-pug'),
      postcss       = require('gulp-postcss'),
      nested        = require('postcss-nested'),
      autoprefixer  = require('autoprefixer'),
      cssnano       = require('cssnano'),
      sugarss       = require('sugarss'),
      rename        = require('gulp-rename'),
      sourcemaps    = require('gulp-sourcemaps'),
      htmlmin       = require('gulp-htmlmin'),
      uglify        = require('gulp-uglify'),
      imagemin      = require('gulp-imagemin'),
      pngquant      = require('imagemin-pngquant'),
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
        'sss':      'src/sss/**/*.sss',
        'css':      'src/**/*.css'
    },
    take = {
        'all':      'src/**/*.*',
        'php':      'src/**/*.php',
        'html':     'src/**/*.html',
        'pug':      'src/**/*.pug',
        'js':       'src/js/**/*.js',
        'sss':      'src/sss/**/*.sss',
        'css':      'src/css/**/*.css',
        'img':      'src/img/**/*.*',
        'stuff':    [
                    'src/**/*.*',
                '!src/sss/**',
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
            'sss':  '!src/sss/**/*',
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
           .pipe(gulppug({
              pretty: '	'
           }))
           .pipe(dest(put.pug))
           .pipe(previewBS.stream());
};

const sss = () => {
    let plugins = [
        autoprefixer({browsers: ['last 1 version']}),
        nested
    ];
    return src(take.sss)
           .pipe(sourcemaps.init())
           .pipe(postcss(plugins, { parser: sugarss }))
           .pipe(rename({ extname: '.css' }))
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
watch(look.sss, sss);
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
           .pipe(gulppug())
           .pipe(htmlmin({collapseWhitespace: true}))
           .pipe(dest(build.pug))
           .pipe(buildBS.stream());
};

const sss_build = () => {
    let plugins = [
        autoprefixer({browsers: ['last 1 version']}),
        nested,
        cssnano()
    ];
    return src(take.sss)
           .pipe(postcss(plugins, { parser: sugarss }))
           .pipe(rename({ extname: '.css' }))
           .pipe(dest(build.css))
           .pipe(buildBS.stream());
};

const js_build = () => {
    return src(take.js)
           .pipe(uglify())
           .pipe(gulp.dest(build.js))
           .pipe(buildBS.stream());
};

const stuff_build = () => {
    return src(take.stuff)
           .pipe(gulp.dest(build.stuff));
};

const del_build = () => {
    return del.sync([del_dir.build]);
};

const img_build = () => {
    return src(take.img)
           .pipe(imagemin({
               progressive: true,
               svgoPlugins: [{removeViewBox: false}],
               use: [pngquant()],
               interlaced: true
           }))
           .pipe(gulp.dest(build.img));
};

const watch_build = () => {
    watch(look.pug, pug_build);
    watch(look.html, html_build);
    watch(look.php, php_build);
    watch(look.sss, sss_build);
    watch(look.js, js_build);
};

//- DEV ------------------------------------------------------------------------
const _preview = series(del_preview, parallel(php, html, pug, sss, js, img, stuff), BS_preview);

const _build = series(del_build, parallel(php_build, html_build, pug_build, sss_build, js_build, img_build, stuff_build), BS_build, watch_build);

exports.default     = series(_preview);
exports.preview     = series(_preview);
exports.build       = series(_build);
exports.sss         = series(sss);