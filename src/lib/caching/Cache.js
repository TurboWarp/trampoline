const CacheEntry = require('./CacheEntry');

/**
 * @typedef {string|any[]} Key
 * A string in tupleKeys = false,
 * An array in tupleKeys = true
 */

/**
 * @typedef CacheOptions
 * @property {number} [ttl]
 * @property {number} [maxEntries]
 * @property {string} [name]
 */

/**
 * A cache that associates a key with a value for a set duration of time.
 * It has a maximum limit of unique key <-> value pairs, set by maxEntries.
 * Entries that have expired are evicted only when the entries list reaches the maximum length, or when a new entry of the same key in inserted.
 * While the Cache is implemented synchronously, it has an asynchronous interface to allow for future improvements.
 * @template T
 */
class Cache {
  /**
   * @param {CacheOptions} [options] Options
   */
  constructor(options = {}) {
    /** Name of this cache */
    this.name = 'name' in options ? options.name : 'Unnamed Cache';

    /** The time, in milliseconds, for cache values to be valid for. */
    this.ttl = 'ttl' in options ? options.ttl : Cache.DEFAULT_OPTIONS.ttl;
    if (this.ttl < 0) throw new Error('TTL cannot be negative');
    
    /** Maximum number of values to cache before the least recently accessed values are evicted. */
    this.maxEntries = 'maxEntries' in options ? options.maxEntries : Cache.DEFAULT_OPTIONS.maxEntries;
    if (this.maxEntries < 0) throw new Error('maxEntries cannot be negative');

    /** @type {CacheEntry[]} */
    this.entries = [];

    /** Enables "Tuple Keys" mode, where the keys are an array instead of a string. */
    this.tupleKeys = false;
  }

  now() {
    return Date.now();
  }

  /**
   * Evict the least recently used cache entries if there is an overflow.
   */
  evictOverflowEntries() {
    while (this.entries.length > this.maxEntries) {
      this.entries.pop();
    }
  }

  /**
   * Determine if an entry in this cache is expired.
   * @param {CacheEntry} entry
   */
  isExpired(entry) {
    return entry.expires - this.now() <= 0;
  }

  /**
   * Move an entry to the front of the list.
   * @param {number} index The index of the entry in the entries list
   */
  moveEntryToFront(index) {
    const [entry] = this.entries.splice(index, 1);
    this.entries.unshift(entry);
  }

  /**
   * Removes all occurences of a certain key from the entries list.
   * @param {Key} key The Key to remove
   */
  removeEntriesWithKey(key) {
    let i = this.entries.length;
    while (i--) {
      const entry = this.entries[i];
      if (this.compareKeys(key, entry.key)) {
        this.entries.splice(i, 1);
      }
    }
  }

  /**
   * Determine whether two keys are identical.
   */
  compareKeys(firstKey, otherKey) {
    if (this.tupleKeys) {
      // Entries that do not much in length cannot be identical.
      if (firstKey.length !== otherKey.length) {
        return false;
      }
      for (var i = 0; i < firstKey.length; i++) {
        // return early if there is not a match
        if (firstKey[i] !== otherKey[i]) {
          return false;
        }
      }
      return true;
    } else {
      return firstKey === otherKey;
    }
  }

  /**
   * Determine whether this Cache is effectively disabled due to its configuration.
   * @returns {boolean}
   */
  isDisabled() {
    return this.ttl <= 0 || this.maxEntries <= 0;
  }

  /**
   * Determine if a key exists and is not expired in this cache.
   * @param {Key} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    for (const entry of this.entries) {
      if (this.compareKeys(key, entry.key) && !this.isExpired(entry)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get a value from the cache.
   * @param {Key} key
   * @returns {Promise<CacheEntry<T>|null>}
   */
  async get(key) {
    // We will search through the entries list, front to back.
    // If a non-expired entry is found with the same key as requested, we will move it to the front of the entries list, and return it.
    // By moving it to the front we can reduce the chance that commonly requested entries will be evicted. (as they are evicted from the back)
    for (var i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (this.compareKeys(key, entry.key) && !this.isExpired(entry)) {
        this.moveEntryToFront(i);
        return entry;
      }
    }
    return null;
  }

  /**
   * Put a value into the cache.
   * @param {Key} key
   * @param {T} value
   */
  async put(key, value) {
    if (isNaN(this.ttl)) {
      throw new Error('Invalid Cache TTL: ' + this.ttl);
    }
    if (this.isDisabled()) {
      // don't even bother trying
      return;
    }
    // Remove old values, if any.
    this.removeEntriesWithKey(key);
    const entry = new CacheEntry(key, value, this.now() + this.ttl);
    this.entries.unshift(entry);
    this.evictOverflowEntries();
    return entry;
  }
}

Cache.DEFAULT_OPTIONS = {
  ttl: 1000 * 60,
  maxEntries: 1000,
};

module.exports = Cache;
