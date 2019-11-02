class Logger {
  constructor() {
    this.debugEnabled = false;
  }

  /**
   * Log a debug message.
   * @param {any[]} args
   */
  debug(...args) {
    if (this.debugEnabled) {
      console.log('\u001b[90mdebug\u001b[37m', ...args);
    }
  }
}

module.exports = new Logger();
