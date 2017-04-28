const DEV = process.env.NODE_ENV !== 'ci';

module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
      'lib/jquery-2.1.3.js',
      'lib/mock-ajax.js',
      'lib/jasmine-fixture.js',
      'karma.test.js',
      // '00*/**/*.js',
      // '01*/**/*.js',
      // '02*/**/*.js',
      // '03*/**/*.js',
      // '04*/**/*.js',
      // '05*/**/*.js',
    ],
    exclude: [
      'lib/jasmine-2.1.3/**/*'
    ],
    reporters: ['progress'],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadless: {
        base: DEV ? 'ChromeCanary' : 'Chrome',
        flags: [
          '--headless',
          '--remote-debugging-port=9222',
        ]
      }
    },
    singleRun: true
  });
};
