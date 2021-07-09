const USERNAME_REGEX = /^[a-zA-Z-_0-9]{3,30}$/;
module.exports.isValidUsername = function isValidUsername(username) {
  return USERNAME_REGEX.test(username);
};

function isInteger(numStr) {
  const num = +numStr;
  const fractional = num - Math.floor(num);
  return !Number.isNaN(num) &&
    Number.isFinite(num) &&
    num.toString() === numStr &&
    fractional === 0;
}

module.exports.isValidIdentifier = function isValidIdentifier(id) {
  return isInteger(id) && id >= 0;
};

module.exports.isValidOffset = function isValidOffset(offset) {
  return isInteger(offset) && offset >= 0;
};
