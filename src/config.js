// To change the config, edit config.private.js.
// To change the default values, edit config.default.js

const defaults = require('./config.default');
// @ts-ignore
const user = require('./config.private');
const utils = require('./utils');
utils.deepMerge(defaults, user);

module.exports = defaults;
