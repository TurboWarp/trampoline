const { STATS: config } = require('../config');
const logger = require('./statLogger');

const trackers = [];

function addTracker(tracker) {
  trackers.push(tracker);
}

// Load trackers
if (config.requestTracking.enabled) addTracker(require('./requestTracking'));
if (config.cacheTracking.enabled) addTracker(require('./cacheTracking'));
if (config.refererTracking.enabled) addTracker(require('./refererTracking'));

function printStatistics() {
  try {
    logger.header('Start stats update');
    for (const t of trackers) {
      if (t.run) {
        t.run();
      }
    }
  } catch (e) {
    logger.warn('Stats encountered an error');
    logger.warn(e);
  }
  logger.header('End stats update');
}

function startInterval() {
  setInterval(printStatistics, config.interval);
}

function middleware(req, res, next) {
  for (const t of trackers) {
    if (t.middleware) {
      t.middleware(req, res);
    }
  }
  next();
}

module.exports = {
  startInterval,
  middleware,
};
