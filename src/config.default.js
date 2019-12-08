// This is the default configuration.
// To make private changes, edit config.private.js in the parent directory (automatically created after first launch)

module.exports.API_WRAPPER = {
  enabled: true,
  projectCache: { ttl: 1000 * 60 * 60, maxEntries: 500 },
  userCache: { ttl: 1000 * 60 * 60, maxEntries: 500 },
  studioCache: { ttl: 1000 * 60 * 60, maxEntries: 500 },
};

module.exports.SITE_API_WRAPPER = {
  enabled: true,
  studioPageCache: { ttl: 1000 * 60 * 60, maxEntries: 100 },
};

module.exports.CLOUD_WRAPPER = {
  enabled: true,
  logCache: { ttl: 1000 * 60, maxEntries: 50 },
};

module.exports.APP = {
  allowOrigins: '*',
  enableStatic: true,
  staticRoot: 'static',
  notFoundFile: '404.html',
  port: process.env.PORT || 8080,
};
