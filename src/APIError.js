class APIError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.code = code;
    this.name = 'APIError';
  }
}
APIError.INTERNAL_ERROR = 'INTERNAL_ERROR';
APIError.TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';
APIError.BAD_REQUEST = 'BAD_REQUEST';
APIError.NOT_FOUND = 'NOT_FOUND';
APIError.UPSTREAM_ERROR = 'UPSTREAM_ERROR';

module.exports = APIError;
