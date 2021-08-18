class APIError extends Error {
  /**
   * @param {number} status HTTP status code for the error.
   * @param {string} message The error message, which may be shown to users.
   */
  constructor(status, message) {
    super(`${message}`);
    this.status = status;
    this.name = 'APIError';
  }
}

/** An error that indicates something went wrong internally */
APIError.InternalError = class extends APIError {
  constructor(message) { super(500, message); }
};
/** An error that indicates too many requests are being made in total or by an individual user */
APIError.TooManyRequests = class extends APIError {
  /** @param {string} message */
  constructor(message) { super(429, message); }
};
/** An error that indicates there is something wrong with the request */
APIError.BadRequest = class extends APIError {
  /** @param {string} message */
  constructor(message) { super(400, message); }
};
/** An error that indicates that the item asked for does not exist */
APIError.NotFound = class extends APIError {
  /** @param {string} message */
  constructor(message) { super(404, message); }
};
/** An error that indicates that an upstream API returned a strange response */
APIError.UpstreamError = class extends APIError {
  /** @param {string} message */
  constructor(message) { super(500, message); }
};

/**
 * Get the proper HTTP status code to use for an error.
 * @param {any} error
 * @returns {number}
 */
APIError.getStatus = function(error) {
  if (error && typeof error.status === 'number') return error.status;
  return 500;
};

/**
 * Get the user-facing message for an error.
 * @param {any} error
 * @returns {string}
 */
APIError.getMessage = function(error) {
  if (error && error.message) return error.message;
  return '' + error;
};

module.exports = APIError;
