const ScratchSiteWrapper = require('../ScratchSiteWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchSiteWrapper extends ScratchSiteWrapper {
  constructor() {
    super();
    this.studioPageCache = new ErrorTolerantComputedCache(60000, (key) => super.getProjectsInStudio(key[0], key[1]));
    this.studioPageCache.tupleKeys = true;
  }

  async getProjectsInStudio(studio, page) {
    return await this.studioPageCache.computeIfMissing([studio, page]);
  }
}

module.exports = CachingScratchSiteWrapper;
