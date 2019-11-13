// This is the default configuration.
// It should not be changed. Edit config.private.js instead.

module.exports.STATIC = {
  enabled: true,
};

module.exports.API_WRAPPER = {
  enabled: true,
  projectCache: 1000 * 60 * 60,
  userCache: 1000 * 60 * 60,
  studioCache: 1000 * 60 * 60,
};

module.exports.SITE_API_WRAPPER = {
  enabled: true,
  studioPageCache: 1000 * 60 * 60,
};

module.exports.CLOUD_WRAPPER = {
  enabled: true,
  logCache: 1000 * 60,
};

module.exports.APP = {
  allowOrigins: '*',
  port: process.env.PORT || 8080,
};
