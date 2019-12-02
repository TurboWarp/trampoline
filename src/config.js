// To change the config, edit config.private.js.
// To change the default values, edit config.default.js

const utils = require('./utils');
const logger = require('./logger');

const defaults = require('./config.default');
// @ts-ignore
try {
  const private = require('./config.private');
  utils.deepMerge(defaults, private);
} catch (e) {
  logger.error('cannot read private settings', e);
}

module.exports = defaults;
