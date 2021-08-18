const express = require('express');
const logger = require('./logger');
const api = require('./api');
const resizeImage = require('./resize');

const app = express();
const config = require('./config');

app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('x-powered-by', false);
app.set('query parser', (q) => new URLSearchParams(q));

app.use((req, res, next) => {
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'no-referrer');
  res.header('Permissions-Policy', 'interest-cohort=()');
  next();
});

const STATIC_ROOT = 'static';
app.use(express.static(STATIC_ROOT));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.APP.allowOrigins);
  res.header('Content-Security-Policy', 'default-src \'self\'')
  logger.debug('Handling Request :: %s', req.path);
  next();
});

const formatExpires = (unix) => {
  const date = new Date(unix);
  const now = Date.now();
  // It's possible an expired response is returned or that it has become outdated since it was received.
  const until = Math.max(0, date.getTime() - now);
  return {
    expires: date.toUTCString(),
    cacheControl: `public, max-age=${Math.round(until / 1000)}, immutable`
  };
};

const handleResponse = (res, dbPromise) => {
  dbPromise
    .then(({status, data, expires}) => {
      res.status(status);
      if (status !== 200) {
        res.type('application/json');
      }
      const formattedExpires = formatExpires(expires);
      // TODO: consider dropping `Expires` as `Cache-Control` takes precedence
      res.header('Expires', formattedExpires.expires);
      res.header('Cache-Control', formattedExpires.cacheControl);
      res.send(data);
    })
    .catch((error) => {
      logger.error('' + ((error && error.stack) || error));
      res.status(500);
      res.type('text/plain');
      res.send('Internal server error');
    });
};

app.get('/proxy/projects/:id', (req, res) => {
  res.type('application/json');
  handleResponse(res, api.getProject(req.params.id));
});

app.get('/proxy/users/:username', (req, res) => {
  res.type('application/json');
  handleResponse(res, api.getUser(req.params.username));
});

app.get('/proxy/studios/:id/projects', (req, res) => {
  const offset = req.query.get('offset') || '0';
  res.type('application/json');
  handleResponse(res, api.getStudioPage(req.params.id, offset));
});

app.get('/proxy/studios/:id/projectstemporary/:offset', (req, res) => {
  res.type('application/json');
  handleResponse(res, api.getStudioPage(req.params.id, req.params.offset));
});

app.get('/thumbnails/:id', (req, res) => {
  const width = req.query.get('width') || '480';
  const height = req.query.get('height') || '360';
  // probably not spec compliant but good enough
  const format = (req.get('accept') || '').includes('image/webp') ? 'image/webp' : 'image/jpeg';
  res.type(format);
  res.header('Vary', 'Accepts');
  handleResponse(res, api.getThumbnail(req.params.id).then((response) => {
    if (response.status !== 200) {
      return response;
    }
    return resizeImage(response.data, +width, +height, format)
      .then((newData) => {
        response.data = newData;
        return response;
      });
    // TODO: catch errors and respond with better message
  }));
});

app.get('/cloud-proxy*', (req, res) => {
  res.status(404);
  res.send('not implemented');
});

app.get('/site-proxy*', (req, res) => {
  res.status(404);
  res.send('not implemented');
});

app.use((req, res) => {
  logger.debug('404: %s', req.path);
  res.status(404).sendFile('404.html', { root: STATIC_ROOT });
});

module.exports = app;
