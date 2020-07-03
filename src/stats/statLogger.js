const logger = require('../logger');

function header(message) {
  logger.info('Stats *** %s ***', message);
}

function info(message) {
  logger.info('Stats %s', message);
}

function warn(message) {
  logger.warn('Stats warning! %s', message);
}

module.exports = {
  header,
  info,
  warn,
};
