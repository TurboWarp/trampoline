const logger = require('./logger');
const {isTest} = require('./environment');
const metrics = require('./metrics');

module.exports = ({
  name,
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
      metrics.rateLimited.inc({name});
      if (current === requests) {
        logger.warn(`rate limit ${name} exceeded`);
      }
    }
    memory.set(ip, current + 1);
    next();
  };
};
