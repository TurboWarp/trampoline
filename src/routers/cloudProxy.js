const express = require('express');
const ScratchCloudWrapper = require('../lib/caching/CachingScratchCloudWrapper');
const CacheEntry = require('../lib/caching/CacheEntry');
const APIError = require('../lib/APIError');
const { CLOUD_WRAPPER: config } = require('../config');

const router = express.Router();
const api = new ScratchCloudWrapper();
api.logCache.ttl = config.logCache;

/**
 * @param {Promise<[boolean, CacheEntry]>} wrapperPromise 
 */
function apiResponse(wrapperPromise, res) {
  wrapperPromise.then((data) => {
    const [cached, entry] = data;
    res.header('Expires', entry.getExpiresDate());
    res.json(entry.value);
  }).catch((err) => {
    const status = APIError.getStatus(err);
    const errorCode = APIError.getCode(err);
    const message = APIError.getMessage(err);
    res.status(status);
    res.json({
      error: errorCode,
      message,
      status,
    });
  });
}

router.get('/logs/:project', (req, res) => {
  const project = req.params.project;
  const limit = +req.query.limit || 40;
  const offset = +req.query.offset || 0;
  apiResponse(api.getLogsCached(project, limit, offset), res);
});

module.exports = router;
