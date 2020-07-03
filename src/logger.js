const winston = require('winston');

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/log.log' }),
  ],
});

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
