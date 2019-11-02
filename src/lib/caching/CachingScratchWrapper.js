const ScratchWrapper = require('../ScratchWrapper');
const ComputedCache = require('./ComputedCache');

class CachingScratchWrapper extends ScratchWrapper {
  constructor() {
    super();
    this.projectCache = new ComputedCache(60000, this.wrapComputer(this.getProject));
    this.userCache = new ComputedCache(60000, this.wrapComputer(this.getUser));
    this.studioCache = new ComputedCache(60000, this.wrapComputer(this.getStudio));
  }

  wrapComputer(computer) {
    computer = computer.bind(this);
    return async (key) => {
      try {
        const value = await computer(key);
        return { success: true, value: value };
      } catch (e) {
        return { success: false, value: e };
      }
    }
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
