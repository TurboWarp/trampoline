const ScratchWrapper = require('../ScratchWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor({
    projectCacheOptions,
    userCacheOptions,
    studioCacheOptions,
  }) {
    super();
    this.projectCache = new ErrorTolerantComputedCache(projectCacheOptions, (key) => super.getProject(key));
    this.userCache = new ErrorTolerantComputedCache(userCacheOptions, (key) => super.getUser(key));
    this.studioCache = new ErrorTolerantComputedCache(studioCacheOptions, (key) => super.getStudio(key));
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
