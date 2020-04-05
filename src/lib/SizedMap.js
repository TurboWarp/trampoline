class MapTooLargeError extends Error {
  constructor() {
    super('Map too large');
  }
}

class SizedMap extends Map {
  constructor(maxSize) {
    super();
    this.maxSize = maxSize;
  }

  set(key, value) {
    if (!this.has(key) && this.size >= this.maxSize) {
      throw new MapTooLargeError();
    }
    super.set(key, value);
    return this;
  }
}

SizedMap.MapTooLargeError = MapTooLargeError;

module.exports = SizedMap;
