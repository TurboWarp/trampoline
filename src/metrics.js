const logger = require('./logger');

const metrics = {
  cacheHit: 0,
  cacheMiss: 0,
  projects: 0,
  users: 0,
  studioPages: 0,
  thumbnailRaw: 0,
  thumbnails: 0,
  avatars: 0,
  translate: 0,
  assets: 0
};

const reset = () => {
  for (const key of Object.keys(metrics)) {
    metrics[key] = 0;
  }
};

const print = () => {
  logger.info('*** Metrics ***');
  logger.info(`hit: ${metrics.cacheHit}  miss: ${metrics.cacheMiss}`);
  logger.info(`projects: ${metrics.projects}  users: ${metrics.users}  studioPages: ${metrics.studioPages}`);
  logger.info(`translate: ${metrics.translate}`);
  logger.info(`avatars: ${metrics.avatars}`);
  logger.info(`thumbnails: ${metrics.thumbnails}  raw: ${metrics.thumbnailRaw}  assets: ${metrics.assets}`);
};

module.exports = {
  metrics,
  reset,
  print
};
