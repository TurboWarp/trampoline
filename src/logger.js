class Logger {
  constructor() {
    this.debugEnabled = false;
    this.infoEnabled = true;
    this.warnEnabled = true;
    this.errorEnabled = true;
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

  info(...args) {
    if (this.infoEnabled) {
      console.log('\u001b[92minfo\u001b[37m', ...args);
    }
  }

  warn(...args) {
    if (this.warnEnabled) {
      console.error('\u001b[93warning!\u001b[37m', ...args);
    }
  }

  error(...args) {
    if (this.errorEnabled) {
      console.error('\u001b[91merror!\u001b[37m', ...args);
    }
  }
}

module.exports = new Logger();
