const ScratchWrapper = require('../ScratchWrapper');
const ComputedCache = require('./ComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor() {
    super();
    this.projectCache = new ComputedCache(1000 * 60, (key) => this.getProject(key));
    this.userCache = new ComputedCache(1000 * 60, (key) => this.getUser(key));
    this.studioCache = new ComputedCache(1000 * 60, (key) => this.getStudio(key));
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
