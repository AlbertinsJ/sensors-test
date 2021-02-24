// Variables
const base = '..';
const gulp = require('gulp');
const {
	watch,
	series,
	parallel
} = require('gulp');
// Modules
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const minify = require('gulp-minify');
const webserver = require('gulp-webserver');

// Plugins for postcss
var plugins = [
	// Prefixes CSS
	autoprefixer({
		overrideBrowserslist: [
			'last 4 versions',
			'ie >= 9',
			'ie_mob >= 10',
			'ff >= 3.5',
			'chrome >= 4.0',
			'safari >= 3.1',
			'opera >= 10.5',
			'ios >= 7',
			'android >= 4.4',
			'bb >= 10',
		]
	}),
	// Minifies CSS
	cssnano(),
];

// Theme
const distribution = base + '/app';
const source = base + '/assets';

var theme_paths = {
	build: {
		js: distribution + '/js/',
		css: distribution + '/styles'
	},
	watch: {
		js: [
			source + '/js/*.js',
			source + '/js/**/*.js'
		],
		sass: [
			source + '/sass/*.scss',
			source + '/sass/**/*.scss'
		],
	},
	source: {
		js: [
			source + '/js/*.js',
			source + '/js/**/*.js'
		],
		sass: [
			source + '/sass/*.scss',
		]
	}
}

function scss() {
	return (
		gulp.src(theme_paths.source.sass)
		// initialize sourcemaps first
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(sass())
		.on('error', sass.logError)
		// Parse CSS only once
		.pipe(postcss(plugins))
		// Write sourcemaps
		.pipe(sourcemaps.write('/'))
		.pipe(gulp.dest(theme_paths.build.css))
	);
}

function js() {
	return (
		gulp.src(theme_paths.source.js)
		.pipe(minify({
			ext: {
				src: '-debug.js',
				min: '.js'
			}
		}))
		.pipe(gulp.dest(theme_paths.build.js))
	);
}

function web() {
	gulp.src('..')
    	.pipe(webserver({
		      livereload: false,
		      directoryListing: false,
		      open: true
		}));
}

function watching() {
	web();
	watch(theme_paths.watch.sass, scss);
	watch(theme_paths.watch.js, js);
}


exports.js = js;

exports.scss = scss;

exports.default = series(
	parallel(js, scss, web)
);

exports.watch = series(
	parallel(js, scss),
	watching
);