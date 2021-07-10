const logger = require('./logger');

const metrics = {
  cacheHit: 0,
  cacheMiss: 0,
  projects: 0,
  users: 0,
  studioPages: 0
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
};

module.exports = {
  metrics,
  reset,
  print
};
