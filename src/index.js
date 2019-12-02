const express = require('express');
const logger = require('./logger');

const app = express();
const config = require('./config');

app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('json escape', true);
app.set('x-powered-by', false);
logger.debugEnabled = app.get('env') === 'development';

if (config.STATIC.enabled) {
  logger.debug('Enabling Static');
  app.use(express.static('static'));
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.APP.allowOrigins);
  res.header('Content-Security-Policy', 'default-src \'self\'')
  res.header('X-Frame-Options', 'deny');
  logger.debug('Handling Request ::', req.path);
  next();
});

if (config.API_WRAPPER.enabled) {
  logger.debug('Enabling API wrapper');
  app.use('/proxy', require('./routers/apiProxy'));
}

if (config.SITE_API_WRAPPER.enabled) {
  logger.debug('Enabling Site API wrapper');
  app.use('/site-proxy', require('./routers/siteProxy'));
}

if (config.CLOUD_WRAPPER.enabled) {
  logger.debug('Enabling Cloud API wrapper');
  app.use('/cloud-proxy', require('./routers/cloudProxy'));
}

app.use((req, res) => {
  logger.debug('404:', req.path);
  res.type('text/plain');
  res.status(404).send('404');
});

app.listen(config.APP.port, function() {
  logger.info('Started on port', config.APP.port);
});
