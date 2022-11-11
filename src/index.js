const fs = require('fs');
const api = require('./api');
const logger = require('./logger');
const app = require('./server');
const config = require('./config');
const metrics = require('./metrics');

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

api.removeExpiredEntries();
const CLEANUP_INTERVAL = 1000 * 3;
setInterval(api.removeExpiredEntries, CLEANUP_INTERVAL);

const METRICS_INTERVAL = 1000 * 60 * 60;
setInterval(() => {
  metrics.print();
  metrics.reset();
}, METRICS_INTERVAL);
