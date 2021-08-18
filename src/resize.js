const log = require('./logger');
const sharp = require('sharp');

const resizeImage = (buffer, width, height, format) => {
  if (width > 480 || width <= 0 || isNaN(width) || height > 360 || height <= 0 || isNaN(height)) {
    return Promise.reject(new Error('invalid dimensions'));
  }
  log.debug(`Resizing image to ${width}x${height} ${format}`);
  const sh = sharp(buffer);
  sh.resize(width, height);
  if (format === 'image/webp') {
    sh.webp({quality: 80});
  } else if (format === 'image/jpeg') {
    sh.jpeg({quality: 80});
  } else if (format === 'image/png') {
    sh.png({quality: 80});
  } else {
    return Promise.reject(new Error('Invalid format'));
  }
  return sh.toBuffer();
};

module.exports = resizeImage;
