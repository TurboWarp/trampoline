module.exports.LOGGING = {
  // console logging is enabled in debug mode (NODE_ENV !== production), disabled in production mode (NODE_ENV === production)
  // set this to true to forcibly enable the console logging in production mode
  forceEnableConsoleLogging: false,
  // these options are passed directly into winston-daily-rotate-file
  // see https://github.com/winstonjs/winston-daily-rotate-file#options
  rotation: {
    filename: '%DATE%.log',
    // LOGS_DIRECTORY is used by systemd
    dirname: process.env.LOGS_DIRECTORY || 'logs',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d',
    createSymlink: true,
  },
};

module.exports.APP = {
  allowOrigins: '*',
  port: process.env.PORT || 8080,
  unixSocketPermissions: -1,
};
