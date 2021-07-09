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
      res.type('application/json');
      res.header('Expires', formatExpires(expires));
      res.send(data);
    })
    .catch((err) => {
      logger.error(`${err}`);
      res.status(500);
      res.send('Internal server error');
    });
};

app.get('/proxy/projects/:id', (req, res) => {
  handleResponse(res, api.getProject(req.params.id));
});

app.get('/proxy/users/:username', (req, res) => {
  handleResponse(res, api.getUser(req.params.username));
});

app.get('/proxy/studios/:id/projectstemporary/:offset', (req, res) => {
  handleResponse(res, api.getStudioPage(req.params.id, req.params.offset));
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
