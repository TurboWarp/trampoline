const winston = require('winston');
require('winston-daily-rotate-file');

const config = require('./config');
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
});

if (config.LOGGING.rotation) {
  logger.add(new winston.transports.DailyRotateFile(config.LOGGING.rotation));
}

if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
  logger.debug('Development mode');
}

module.exports = logger;
