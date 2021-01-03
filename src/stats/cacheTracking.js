const logger = require('./statLogger');
const Cache = require('../lib/caching/Cache');
const InstanceTracker = require('./InstanceTracker');

Cache.tracker = new InstanceTracker();
const seenCacheEntries = new WeakSet();

function printCacheInfo() {
  for (const cache of Cache.tracker.instances) {
    logger.header(`Cache: ${cache.name}`);

    let fresh = 0;
    let stale = 0;
    let unseen = 0;
    let ok = 0;
    let error = 0;
    for (const entry of cache.entries) {
      if (cache.isExpired(entry)) {
        stale++;
      } else {
        fresh++;
      }

      if (entry.error) {
        error++;
      } else {
        ok++;
      }

      if (!seenCacheEntries.has(entry)) {
        unseen++;
        seenCacheEntries.add(entry);
      }
    }

    logger.info(`fresh: ${fresh}  stale: ${stale}  unseen: ${unseen}`);
    logger.info(`error: ${error}  ok: ${ok}`);
  }
}

module.exports = {
  run: printCacheInfo,
};
