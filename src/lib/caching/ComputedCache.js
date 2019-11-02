const Cache = require('./Cache');
const CacheEntry = require('./CacheEntry');
const logger = require('../../logger');

/**
 * @template T
 */
class ComputedCache extends Cache {
  /**
   * @param {number} ttl
   * @param {(key: string) => Promise<T>} computer
   */
  constructor(ttl, computer) {
    super(ttl);
    this.computer = computer;
  }

  /**
   * Get a value from the cache, or compute its value if it does not exist.
   * @param {any} key
   * @returns {Promise<[boolean, CacheEntry<T>]>} A tuple of whether the value was returned from cache or newly computed, and the CacheEntry
   */
  async computeIfMissing(key) {
    const cachedValue = await this.get(key);
    if (cachedValue) {
      logger.debug('ComputedCache: from cache: key:', key);
      return [true, cachedValue];
    }
    logger.debug('ComputedCache: computing: key:', key);
    const newValue = await this.computer(key);
    return [false, await this.put(key, newValue)];
  }
}

module.exports = ComputedCache;
