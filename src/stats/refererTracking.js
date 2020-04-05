const logger = require('./statLogger');
const SizedMap = require('../lib/SizedMap');

const NONE = '(none)';
const INVALID = '(invalid)';

let refererMapOverflow = false;
// TODO: See if Cache can be used instead of this weird SizedMap.
const referers = new SizedMap(50);

function printRefererStats() {
  logger.header('Referers');

  logger.info(`total referers: ${referers.size}`)

  const entries = Array.from(referers.entries());
  entries.sort((a, b) => a[1] - b[1]);

  const detailedLogsCount = Math.min(entries.length, 10);
  for (var rank = 0; rank < detailedLogsCount; rank++) {
    const [key, value] = entries[rank];
    logger.info(` #${rank + 1} "${key}" ${value}`);
  }

  if (refererMapOverflow) {
    logger.warn('referer map overflowed');
    refererMapOverflow = false;
  }

  referers.clear();
}

/**
 * Extract the referer, if any, from a request.
 * @param {import('express').Request} req 
 * @returns {string}
 */
function extractReferer(req) {
  try {
    const referer = req.get('Referer');
    if (!referer) return NONE;
    const url = new URL(referer);
    return url.hostname;
  } catch (e) {
    return INVALID;
  }
}

function trackReferer(req, res) {
  const referer = extractReferer(req);
  const currentValue = referers.get(referer) || 0;
  try {
    referers.set(referer, currentValue + 1);
  } catch (e) {
    if (!refererMapOverflow) {
      logger.warn('referer tracker map error: ' + e);
      refererMapOverflow = true;
    }
  }
}

module.exports = {
  run: printRefererStats,
  middleware: trackReferer,
};
