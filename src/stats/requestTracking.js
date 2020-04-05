const logger = require('./statLogger');

let totalRequests = 0;
let previousRequests = 0;

function printRequestStats() {
  logger.header('Requests');
  logger.info(`total requests: ${totalRequests}`);
  logger.info(`since last check: ${totalRequests - previousRequests}`);

  previousRequests = totalRequests;
}

function trackRequest(req, res) {
  totalRequests++;
}

module.exports = {
  run: printRequestStats,
  middleware: trackRequest,
};
