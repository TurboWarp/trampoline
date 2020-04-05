/**
 * InstanceTracker is a place to record instances of classes.
 * @template T
 */
class InstanceTracker {
  constructor() {
    /**
     * The instances of the class.
     * @type {T[]}
     */
    this.instances = [];
  }

  /**
   * Add an instance to this tracker.
   * @param {T} obj The instance of the class
   */
  add(obj) {
    this.instances.push(obj);
  }
}

module.exports = InstanceTracker;
