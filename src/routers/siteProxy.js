const express = require('express');
const CachingScratchSiteWrapper = require('../lib/caching/CachingScratchSiteWrapper');
const APIError = require('../lib/APIError');
const { SITE_API_WRAPPER: config } = require('../config');

const router = express.Router();
const site = new CachingScratchSiteWrapper();
site.studioPageCache.ttl = config.studioPageCache;

// The site-api generally returns HTML. To make sure browsers do not attempt to display this as HTML, we:
//  - set Content-Type to something other than HTML
//  - set a CSP that disallows everything
//  - tell browsers not to try to guess the content type

router.use((req, res, next) => {
  res.type('text/plain');
  res.header('Content-Security-Policy', 'default-src \'none\'');
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});

router.get('/projects/in/:studio/:page', (req, res) => {
  site.getProjectsInStudioCached(req.params.studio, req.params.page).then((data) => {
    const [cached, entry] = data;
    res.header('Expires', entry.getExpiresDate());
    res.end(entry.value);
  }).catch((err) => {
    const status = APIError.getStatus(err);
    const errorCode = APIError.getCode(err);
    const message = APIError.getMessage(err);
    res.status(status);
    res.end(`Error: ${errorCode} (${status}): ${message}`);
  });
});

module.exports = router;
