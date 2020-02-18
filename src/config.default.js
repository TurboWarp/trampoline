// This is the default configuration.
// To make private changes, edit config.private.js in the parent directory (automatically created after first launch)

// These are some helpful constants you may want in your private config.
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

module.exports.API_WRAPPER = {
  enabled: true,
  projectCache: { name: 'project-meta', ttl: HOUR * 6, maxEntries: 1000 },
  userCache: { name: 'user-meta', ttl: HOUR, maxEntries: 50 },
  studioCache: { name: 'studio-meta', ttl: HOUR, maxEntries: 100 },
};

module.exports.SITE_API_WRAPPER = {
  enabled: true,
  studioPageCache: { name: 'studio-pages', ttl: HOUR, maxEntries: 100 },
};

module.exports.CLOUD_WRAPPER = {
  enabled: true,
  logCache: { name: 'cloud-history', ttl: MINUTE * 30, maxEntries: 100 },
};

module.exports.APP = {
  allowOrigins: '*',
  enableStatic: true,
  staticRoot: 'static',
  notFoundFile: '404.html',
  port: process.env.PORT || 8080,
};
