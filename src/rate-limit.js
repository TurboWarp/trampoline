const logger = require('./logger');
const {isTest} = require('./environment');

module.exports = ({
  requests
}) => {
  const memory = new Map();

  if (!isTest) {
    setInterval(() => {
      memory.clear();
    }, 1000 * 60 * 60);
  }

  return (req, res, next) => {
    const ip = req.ip;
    const current = memory.get(ip) || 0;
    if (current >= requests) {
      req.rateLimited = true;
      if (current === requests) {
        // for debugging purposes
        logger.warn('rate limit exceeded');
      }
    }
    memory.set(ip, current + 1);
    next();
  };
};
