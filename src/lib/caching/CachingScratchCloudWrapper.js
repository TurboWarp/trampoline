const ScratchCloudWrapper = require('../ScratchCloudWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchWrapper extends ScratchCloudWrapper {
  constructor({
    logCacheOptions,
  }) {
    super();
    this.logCache = new ErrorTolerantComputedCache(logCacheOptions, (key) => super.getLogs(key[0], key[1], key[2]));
    this.logCache.tupleKeys = true;
  }

  async getLogs(project, limit, offset) {
    return await this.logCache.computeIfMissing([project, limit, offset]);
  }
}

module.exports = CachingScratchWrapper;
