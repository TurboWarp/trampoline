const RequestQueue = require('./RequestQueue');
const APIError = require('./APIError');
const ScratchUtils = require('./ScratchUtils');

/**
 * API Wrapper for the site-api of Scratch: https://scratch.mit.edu/site-api/*
 */
class ScratchSiteWrapper {
  constructor() {
    this.requestQueue = new RequestQueue(50);
    this.STUDIO_API = 'https://scratch.mit.edu/site-api/projects/in/$id/$page/';
  }

  verifyIdentifier(id) {
    if (!ScratchUtils.isValidIdentifier(id)) {
      throw new APIError(APIError.BAD_REQUEST, 'Invalid identifier');
    }
  }

  verifyPage(page) {
    if (!ScratchUtils.isValidPage(page)) {
      throw new APIError(APIError.BAD_REQUEST, 'Invalid page');
    }
  }

  request(url) {
    return this.requestQueue.queuePromise(url);
  }

  async getProjectsInStudio(studio, page) {
    this.verifyIdentifier(studio);
    this.verifyPage(page);
    return this.request(this.STUDIO_API.replace('$id', studio).replace('$page', page));
  }
}

module.exports = ScratchSiteWrapper;
