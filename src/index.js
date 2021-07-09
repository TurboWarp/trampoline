const api = require('./api');
const logger = require('./logger');
const app = require('./server');
const config = require('./config');

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
const JANITOR_INTERVAL = 1000 * 60;
setInterval(api.removeExpiredEntries, JANITOR_INTERVAL);
