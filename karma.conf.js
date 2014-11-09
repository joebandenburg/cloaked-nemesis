module.exports = function (config) {
    config.set({
        basePath: './',
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/lodash/dist/lodash.js',
            'src/**/*.js',
            'test/**/*.js'
        ],
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ]
    });
};