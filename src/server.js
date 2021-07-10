const express = require('express');
const logger = require('./logger');
const api = require('./api');

const app = express();
const config = require('./config');

app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('x-powered-by', false);

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

const formatExpires = (unix) => new Date(+unix).toUTCString();

const handleResponse = (res, dbPromise) => {
  dbPromise
    .then(({status, data, expires}) => {
      res.status(status);
      if (status !== 200) {
        res.type('application/json');
      }
      res.header('Expires', formatExpires(expires));
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

app.get('/proxy/studios/:id/projectstemporary/:offset', (req, res) => {
  res.type('application/json');
  handleResponse(res, api.getStudioPage(req.params.id, req.params.offset));
});

app.get('/thumbnails/:id.png', (req, res) => {
  res.type('image/png');
  handleResponse(res, api.getThumbnail(req.params.id));
});

app.get('/assets/:md5ext.svg', (req, res) => {
  res.type('image/svg+xml');
  handleResponse(res, api.getAsset(`${req.params.md5ext}.svg`));
});
app.get('/assets/:md5ext.png', (req, res) => {
  res.type('image/png');
  handleResponse(res, api.getAsset(`${req.params.md5ext}.png`));
});
app.get('/assets/:md5ext.wav', (req, res) => {
  res.type('audio/wav');
  handleResponse(res, api.getAsset(`${req.params.md5ext}.wav`));
});
app.get('/assets/:md5ext.mp3', (req, res) => {
  res.type('audio/mpeg');
  handleResponse(res, api.getAsset(`${req.params.md5ext}.mp3`));
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
