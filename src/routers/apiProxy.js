const express = require('express');
const ScratchWrapper = require('../lib/caching/CachingScratchWrapper');
const CacheEntry = require('../lib/caching/CacheEntry');
const APIError = require('../lib/APIError');
const { API_WRAPPER: config } = require('../config');

const router = express.Router();
const apiWrapper = new ScratchWrapper();
apiWrapper.projectCache.ttl = config.projectCache;
apiWrapper.userCache.ttl = config.userCache;
apiWrapper.studioCache.ttl = config.studioCache;

/**
 * @param {Promise<[boolean, CacheEntry]>} wrapperPromise 
 */
function apiResponse(wrapperPromise, res) {
  wrapperPromise.then((data) => {
    const [cached, entry] = data;
    // Because our entries are known to expire at an exact time, we will use Expires instead of Cache-Control.
    // With Cache-Control I think you have to do weird max-age stuff that probably won't work as well.
    res.header('Expires', entry.getExpiresDate());

    // Errors are cached as well as success.
    // Expires is set before we handle errors because we do want to cache errors.
    const { success, value } = entry.value;
    if (!success) throw value;

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

router.get('/projects/:id', (req, res) => {
  apiResponse(apiWrapper.getProjectCached(req.params.id), res);
});
router.get('/studios/:id', (req, res) => {
  apiResponse(apiWrapper.getStudioCached(req.params.id), res);
});
router.get('/users/:name', (req, res) => {
  apiResponse(apiWrapper.getStudioCached(req.params.name), res);
});

module.exports = router;
