const ScratchWrapper = require('../ScratchWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor() {
    super();
    this.projectCache = new ErrorTolerantComputedCache({ ttl: 60000 }, (key) => super.getProject(key));
    this.userCache = new ErrorTolerantComputedCache({ ttl: 60000}, (key) => super.getUser(key));
    this.studioCache = new ErrorTolerantComputedCache({ ttl: 60000 }, (key) => super.getStudio(key));
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
