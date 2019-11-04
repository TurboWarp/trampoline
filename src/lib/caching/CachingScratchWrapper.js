const ScratchWrapper = require('../ScratchWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor() {
    super();
    this.projectCache = new ErrorTolerantComputedCache(60000, (key) => this.getProject(key));
    this.userCache = new ErrorTolerantComputedCache(60000, (key) => this.getUser(key));
    this.studioCache = new ErrorTolerantComputedCache(60000, (key) => this.getStudio(key));
  }

  async getProjectCached(key) {
    return await this.projectCache.computeIfMissing(key);
  }

  async getStudioCached(key) {
    return await this.studioCache.computeIfMissing(key);
  }

  async getUserCached(key) {
    return await this.userCache.computeIfMissing(key);
  }
}

module.exports = CachingScratchWrapper;
