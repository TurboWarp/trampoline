const ScratchUtils = require('./ScratchUtils');
const APIError = require('./APIError');
const RequestQueue = require('./RequestQueue');

class ScratchCloudWrapper {
  constructor({
    requestQueue,
  }) {
    this.requestQueue = new RequestQueue(requestQueue);
    this.LOG_API = 'https://clouddata.scratch.mit.edu/logs?projectid=$project&limit=$limit&offset=$offset'
    this.LOG_LIMIT = 100;
  }

  verifyProject(id) {
    if (!ScratchUtils.isValidIdentifier(id)) {
      throw new APIError.BadRequest('Invalid project');
    }
  }

  clampLimit(limit) {
    if (limit > this.LOG_LIMIT) return this.LOG_LIMIT;
    if (limit < 0) return 0;
    return limit;
  }

  clampOffset(offset) {
    if (offset < 0) return 0;
    return offset;
  }

  async getLogs(project, limit, offset) {
    this.verifyProject(project);
    limit = this.clampLimit(limit);
    offset = this.clampLimit(offset);
    const url = this.LOG_API
      .replace('$project', project)
      .replace('$limit', limit)
      .replace('$offset', offset);
    return this.requestQueue.queuePromise(url, { json: true });
  }
};

module.exports = ScratchCloudWrapper;
