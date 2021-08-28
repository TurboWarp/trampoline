const sharp = require('sharp');
const APIError = require('./lib/APIError');
const log = require('./logger');

const resizeImage = async (buffer, width, height, format) => {
  log.debug(`Resizing image to ${width}x${height} ${format}`);
  const sh = sharp(buffer);
  sh.resize(width, height);
  if (format === 'image/webp') {
    sh.webp({quality: 90});
  } else if (format === 'image/jpeg') {
    sh.jpeg({quality: 90});
  } else if (format === 'image/png') {
    sh.png({quality: 90});
  } else {
    throw new APIError.BadRequest('Invalid format');
  }
  return sh.toBuffer();
};

module.exports = resizeImage;
