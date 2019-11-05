/**
 * Recursively copy values from one object into another, in place.
 * @param {any} copyInto Values will be copied into this object.
 * @param {any} copyFrom Values will be copied from this object.
 */
module.exports.deepMerge = function(copyInto, copyFrom) {
  const isObject = (f) => f && typeof f === 'object';

  const keys = Object.keys(copyFrom);
  for (const key of keys) {
    const value = copyFrom[key];
    if (isObject(value)) {
      const existingValue = copyInto[key];
      if (isObject(existingValue)) {
        this.deepMerge(existingValue, value);
      } else {
        copyInto[key] = value;
      }
    } else {
      copyInto[key] = value;
    }
  }
};
