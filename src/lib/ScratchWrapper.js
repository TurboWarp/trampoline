const RequestQueue = require('./RequestQueue');
const APIError = require('./APIError');
const ScratchUtils = require('./ScratchUtils');

/**
 * API Wrapper for the public Scratch API: https://api.scratch.mit.edu/
 */
class ScratchWrapper {
  constructor() {
    this.requestQueue = new RequestQueue(50);
    this.PROJECT_API = 'https://api.scratch.mit.edu/projects/$id';
    this.STUDIO_API = 'https://api.scratch.mit.edu/studios/$id';
    this.USER_API = 'https://api.scratch.mit.edu/users/$name';
  }

  verifyIdentifier(id) {
    if (!ScratchUtils.isValidIdentifier(id)) {
      throw new APIError(APIError.BAD_REQUEST, 'Invalid identifier');
    }
  }

  verifyUsername(username) {
    if (!ScratchUtils.isValidUsername(username)) {
      throw new APIError(APIError.BAD_REQUEST, 'Invalid username');
    }
  }

  jsonRequest(url) {
    return this.requestQueue.queuePromise(url, { json: true })
      .then((response) => {
        if ('code' in response && 'message' in response) {
          switch (response.code) {
            case 'NotFound': throw new APIError(APIError.NOT_FOUND, 'Resource does not exist');
            case 'ResourceNotFound': throw new APIError(APIError.INTERNAL_ERROR, 'Possible routing failure');
            default: throw new APIError(APIError.UPSTREAM_ERROR, 'Upstream or unknown error');
          }
        }
        return response;
      });
  }

  async getProject(id) {
    this.verifyIdentifier(id);
    return this.jsonRequest(this.PROJECT_API.replace('$id', id));
  }

  async getStudio(id) {
    this.verifyIdentifier(id);
    return this.jsonRequest(this.STUDIO_API.replace('$id', id));
  }

  async getUser(name) {
    this.verifyUsername(name);
    return this.jsonRequest(this.USER_API.replace('$name', name));
  }
}

module.exports = ScratchWrapper;
