class Logger {
  constructor() {
    this.debugEnabled = process.env.NODE_ENV === 'development';
  }

  debug(...args) {
    if (this.debugEnabled) {
      console.log('\u001b[90mdebug\u001b[37m', ...args);
    }
  }
}

module.exports = new Logger();
