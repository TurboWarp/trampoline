const USERNAME_REGEX = /^[a-zA-Z-_0-9]{1,30}$/;
module.exports.isValidUsername = function isValidUsername(username) {
  return USERNAME_REGEX.test(username);
};

function isInteger(numStr) {
  const num = +numStr;
  const fractional = num - Math.floor(num);
  return !Number.isNaN(num) &&
    Number.isFinite(num) &&
    fractional === 0;
}

module.exports.isValidIdentifier = function isValidIdentifier(id) {
  return isInteger(id) && id >= 0;
};

module.exports.isValidPage = function isValidPage(id) {
  return isInteger(id) && id >= 1;
};
