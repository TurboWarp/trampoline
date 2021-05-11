const ScratchWrapper = require('../ScratchWrapper');
const ErrorTolerantComputedCache = require('./ErrorTolerantComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor({
    requestQueue,
    projectCache,
    userCache,
    studioCache,
    studioProjectsCache,
  }) {
    super({ requestQueue });
    this.projectCache = new ErrorTolerantComputedCache(projectCache, (key) => super.getProject(key));
    this.userCache = new ErrorTolerantComputedCache(userCache, (key) => super.getUser(key));
    this.studioCache = new ErrorTolerantComputedCache(studioCache, (key) => super.getStudio(key));
    this.studioProjectsCache = new ErrorTolerantComputedCache(studioProjectsCache, (key) => super.getStudioProjects(key[0], key[1]));
    this.studioProjectsCache.tupleKeys = true;
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

  async getStudioProjects(id, offset) {
    return await this.studioProjectsCache.computeIfMissing([id, offset]);
  }
}

module.exports = CachingScratchWrapper;
