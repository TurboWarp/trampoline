// This is the default configuration.
// To make private changes, edit config.private.js in the parent directory (automatically created after first launch)

// These are some helpful constants you may want in your private config.
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

module.exports.API_WRAPPER = {
  enabled: true,
  requestQueue: { throttle: 50, maxBacklog: 100 },
  projectCache: { name: 'project-meta', ttl: HOUR * 6, maxEntries: 1000 },
  userCache: { name: 'user-meta', ttl: HOUR * 6, maxEntries: 50 },
  studioCache: { name: 'studio-meta', ttl: HOUR * 6, maxEntries: 100 },
};

module.exports.SITE_API_WRAPPER = {
  enabled: true,
  requestQueue: { throttle: 250, maxBacklog: 20 },
  studioPageCache: { name: 'studio-pages', ttl: HOUR * 6, maxEntries: 100 },
};

module.exports.CLOUD_WRAPPER = {
  enabled: true,
  requestQueue: { throttle: 100, maxBacklog: 100 },
  logCache: { name: 'cloud-history', ttl: MINUTE * 30, maxEntries: 100 },
};

module.exports.APP = {
  allowOrigins: '*',
  enableStatic: true,
  staticRoot: 'static',
  notFoundFile: '404.html',
  port: process.env.PORT || 8080,
};
