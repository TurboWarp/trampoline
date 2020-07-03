// To change the config, edit config.private.js in the repository root. (created after first run)
// To change the default values, edit config.default.js

const fs = require('fs');
const path = require('path');
const utils = require('./utils');

// cannot use logger here as that would be a circular dependency: logger depends on config

const defaultConfig = require('./config.default');
const privateConfigPath = path.join(__dirname, '..', 'config.private.js');

// Create the private config file, if it is missing.
try {
  fs.lstatSync(privateConfigPath);
} catch (e) {
  try {
    fs.writeFileSync(privateConfigPath, '');
  } catch (e) {
    console.error('cannot create private config', e);
  }
}

// Attempt to load the private config
try {
  // @ts-ignore
  const privateConfig = require('../config.private');
  utils.deepMerge(defaultConfig, privateConfig);
} catch (e) {
  console.error('cannot read private config', e);
}

module.exports = defaultConfig;
