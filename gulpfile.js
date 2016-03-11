'use strict';

// the version of Track-with-tags
var version = require('./package.json').version;

// gulp and dependencies
var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify'),
    minificationOptions = {
        output: {},
        preserveComments: 'some'
    };
// used to merge the package version
var replace = require('gulp-replace');
// used to merge AngularJS and the module
var streamqueue = require('streamqueue');

gulp.task('package_no-angularjs', function () {
    return gulp.src(['index.js'])
        // sets the package version numbers
        .pipe(replace('@track-with-tags_version', 'v' + version))
        .pipe(concat('track-with-tags_raw.js'))
        .pipe(minify(minificationOptions))
        .pipe(gulp.dest('libs'))
});

gulp.task('package_with-angularjs', function () {
    var stream = streamqueue({ objectMode: true });

    var angularStream = gulp.src('node_modules/angular/angular.js');

    var trackWithTagsStream = gulp.src('index.js')
        // sets the package version numbers
        .pipe(replace('@track-with-tags_version', 'v' + version));

    stream.queue(angularStream);
    stream.queue(trackWithTagsStream);
    return stream.done()
        .pipe(concat('track-with-tags_bundled.js'))
        .pipe(minify(minificationOptions))
        .pipe(gulp.dest('libs'))
});
