// To change the config, edit config.private.js in the repository root. (created after first run)
// To change the default values, edit config.default.js

const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const logger = require('./logger');

const defaultConfig = require('./config.default');
const privateConfigPath = path.join(__dirname, '..', 'config.private.js');

// Create the private config file, if it is missing.
try {
  fs.lstatSync(privateConfigPath);
} catch (e) {
  logger.debug('creating private config file');
  try {
    fs.writeFileSync(privateConfigPath, '');
  } catch (e) {
    logger.error('cannot create private config', e);
  }
}

// Attempt to load the private config
try {
  const private = require('../config.private');
  utils.deepMerge(defaultConfig, private);
} catch (e) {
  logger.error('cannot read private config', e);
}

module.exports = defaultConfig;
