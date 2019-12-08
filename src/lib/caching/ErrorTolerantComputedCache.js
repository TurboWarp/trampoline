const ComputedCache = require('./ComputedCache');

/**
 * @template E
 * @typedef ErrorTolerantValue
 * @property {Error|null} error
 * @property {E|null} value
 */

/**
 * @template T
 */
class ErrorTolerantComputedCache extends ComputedCache {
  /**
   * @param {import('./Cache').CacheOptions} options
   * @param {(key: string) => Promise<any>} computer
   */
  constructor(options, computer) {
    super(options, computer);
    this.computer = this.makeErrorTolerant(this.computer);
  }

  /**
   * Convert a computer to one that uses ErrorTolerantValue instead
   * @param {(value: any) => Promise<T>} baseFunction 
   * @returns {(value: any) => Promise<ErrorTolerantValue<T>>}
   */
  makeErrorTolerant(baseFunction) {
    return async function(value) {
      try {
        const returnValue = await baseFunction(value);
        return { error: null, value: returnValue };
      } catch (e) {
        return { error: e, value: null };
      }
    };
  }

  /**
   * @param {any} key
   * @param {ErrorTolerantValue<T>} tolerantValue
   */
  async put(key, tolerantValue) {
    const realValue = tolerantValue.value;
    const error = tolerantValue.error;
    const entry = await super.put(key, realValue);
    entry.error = error;
    return entry;
  }

  async computeIfMissing(key) {
    const [cached, entry] = await super.computeIfMissing(key);
    if (entry.error !== null) {
      throw entry.error;
    }
    return /** @type {any} */ ([cached, entry]);
  }
}

module.exports = ErrorTolerantComputedCache;
