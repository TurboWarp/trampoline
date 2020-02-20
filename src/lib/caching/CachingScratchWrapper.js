const ScratchWrapper = require('../ScratchWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor({
    requestQueue,
    projectCache,
    userCache,
    studioCache,
  }) {
    super({ requestQueue });
    this.projectCache = new ErrorTolerantComputedCache(projectCache, (key) => super.getProject(key));
    this.userCache = new ErrorTolerantComputedCache(userCache, (key) => super.getUser(key));
    this.studioCache = new ErrorTolerantComputedCache(studioCache, (key) => super.getStudio(key));
  }

  async getProject(key) {
    return await this.projectCache.computeIfMissing(key);
  }

  async getStudio(key) {
    return await this.studioCache.computeIfMissing(key);
  }

  async getUser(key) {
    return await this.userCache.computeIfMissing(key);
  }
}

module.exports = CachingScratchWrapper;
