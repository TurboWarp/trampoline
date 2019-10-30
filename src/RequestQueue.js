const https = require('https');
const request = require('request');
const logger = require('./logger');
const APIError = require('./APIError');

class RequestQueue {
  constructor(throttle) {
    this.backlog = [];
    this.lastRequest = 0;
    this.processing = false;
    this.throttle = throttle;
    this.maxBacklog = 100;
    this.agent = new https.Agent({ keepAlive: true });
  }

  now() {
    return Date.now();
  }

  timeSinceLastRequest() {
    return this.now() - this.lastRequest;
  }

  timeUntilNextRequest() {
    return Math.max(this.throttle - this.timeSinceLastRequest(), 0);
  }

  backlogEmpty() {
    return this.backlog.length === 0;
  }

  backlogFilled() {
    return this.backlog.length >= this.maxBacklog;
  }

  processNextRequest() {
    if (this.backlogEmpty()) {
      throw new APIError(APIError.INTERNAL_ERROR, 'Cannot process next request; nothing in queue');
    }
    const { url, callback, options } = this.backlog.shift();
    this.lastRequest = this.now();
    request.get(url, { ...options, agent: this.agent }, (err, res, body) => {
      if (err) {
        callback(new APIError(APIError.INTERNAL_ERROR, err.code + ': ' + err.message), null);
        return;
      }

      switch (res.statusCode) {
        case 200: callback(null, body); break;
        case 404: callback(new APIError(APIError.NOT_FOUND, 'Resource does not exist')); break;
        default: callback(new APIError(APIError.UPSTREAM_ERROR, 'HTTP Status Code: ' + res.statusCode)); break;
      }

      logger.debug('RequestQueue processed request in', this.timeSinceLastRequest(), 'next request in', this.timeUntilNextRequest());
      if (this.backlogEmpty()) {
        this.stopProcessingRequests();
      } else {
        this.scheduleNextRequest(this.timeUntilNextRequest());
      }
    });
  }

  scheduleNextRequest(delay) {
    setTimeout(() => this.processNextRequest(), delay);
  }

  beginProcessingRequests() {
    this.processing = true;
    this.scheduleNextRequest(this.timeUntilNextRequest());
  }

  stopProcessingRequests() {
    this.processing = false;
  }

  queue(url, options, callback) {
    logger.debug('RequestQueue: queue url:', url, 'backlog size:', this.backlog.length);
    if (this.backlogFilled()) {
      callback(new APIError(APIError.TOO_MANY_REQUESTS, 'Request backlog is filled.'), null);
      return;
    }
    this.backlog.push({ url: url, options: options, callback: callback });
    if (!this.processing) {
      this.beginProcessingRequests();
    }
  }

  queuePromise(url, options) {
    return new Promise((resolve, reject) => {
      this.queue(url, options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
}

module.exports = RequestQueue;
