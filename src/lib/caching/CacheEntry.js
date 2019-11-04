/**
 * An entry in a Cache.
 * @template T
 */
class CacheEntry {
  /**
   * @param {any} key 
   * @param {T} value 
   * @param {number} expires 
   */
  constructor(key, value, expires) {
    /** The key of this entry. */
    this.key = key;
    /** The value stored in this entry. */
    this.value = value;
    /** The time, in milliseconds since the epoch, that this CacheEntry will expire at. */
    this.expires = expires;
    /** Used by ErrorTolerantComputedCache to cache errors. */
    this.error = null;
  }

  /**
   * Convert this CacheEntry's expires time to a UTC date string
   */
  getExpiresDate() {
    return new Date(this.expires).toUTCString();
  }
}

module.exports = CacheEntry;
