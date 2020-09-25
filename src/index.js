const express = require('express');
const fs = require('fs');
const logger = require('./logger');

const app = express();
const config = require('./config');

if (config.STATS.enabled) {
  logger.info('Enabling stat tracking');
  const statModule = require('./stats');
  app.use(statModule.middleware);
  statModule.startInterval();
}

app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('json escape', true);
app.set('x-powered-by', false);

if (config.APP.enableStatic) {
  logger.debug('Enabling Static');
  app.use(express.static(config.APP.staticRoot));
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.APP.allowOrigins);
  res.header('Content-Security-Policy', 'default-src \'self\'')
  res.header('X-Frame-Options', 'deny');
  logger.debug('Handling Request :: %s', req.path);
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
  logger.debug('404: %s', req.path);
  res.status(404).sendFile(config.APP.notFoundFile, { root: config.APP.staticRoot });
});

const port = config.APP.port;
app.listen(port, function() {
  // Update permissions of unix sockets
  if (typeof port === 'string' && port.startsWith('/') && config.APP.unixSocketPermissions >= 0) {
    fs.chmod(port, config.APP.unixSocketPermissions, function(err) {
      if (err) {
        logger.error('could not chmod unix socket: ' + err);
        process.exit(1);
      }
    });
  }
  logger.info('Started on port: %s', port);
});
