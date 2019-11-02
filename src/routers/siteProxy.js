const express = require('express');
const ScratchSiteWrapper = require('../lib/ScratchSiteWrapper');

const router = express.Router();
const site = new ScratchSiteWrapper();

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
  res.contentType('text/plain');
  site.getProjectsInStudio(req.params.studio, req.params.page).then((data) => {
    res.end(data);
  });
});

module.exports = router;
