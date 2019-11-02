class APIError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, status, message) {
    super(`${message}`);
    this.code = code;
    this.status = status;
    this.name = 'APIError.' + code;
  }
}

/** An error that indicates something went wrong internally */
APIError.InternalError = class extends APIError {
  constructor(message) { super('INTERNAL_ERROR', 500, message); }
};
/** An error that indicates too many requests are being made in total or by an individual user */
APIError.TooManyRequests = class extends APIError {
  constructor(message) { super('TOO_MANY_REQUESTS', 429, message); }
};
/** An error that indicates there is something wrong with the request */
APIError.BadRequest = class extends APIError {
  constructor(message) { super('BAD_REQUEST', 400, message); }
};
/** An error that indicates that the item asked for does not exist */
APIError.NotFound = class extends APIError {
  constructor(message) { super('NOT_FOUND', 404, message); }
};
/** An error that indicates that an upstream API returned a strange response */
APIError.UpstreamError = class extends APIError {
  constructor(message) { super('UPSTREAM_ERROR', 500, message); }
};

APIError.getStatus = function(error) {
  return error.status || 500;
};
APIError.getCode = function(error) {
  return error.code || 'UNKNOWN';
};
APIError.getMessage = function(error) {
  return error.message || 'unknown';
};

module.exports = APIError;
