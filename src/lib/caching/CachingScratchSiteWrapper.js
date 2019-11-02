const ScratchSiteWrapper = require('../ScratchSiteWrapper');
const ComputedCache = require('./ComputedCache');

class CachingScratchSiteWrapper extends ScratchSiteWrapper {
  constructor() {
    super();
    this.studioPageCache = new ComputedCache(1000 * 60, (key) => this.getProjectsInStudio(key[0], key[1]));
    this.studioPageCache.tupleKeys = true;
  }

  async getProjectsInStudioCached(studio, page) {
    return await this.studioPageCache.computeIfMissing([studio, page]);
  }
}

module.exports = CachingScratchSiteWrapper;
