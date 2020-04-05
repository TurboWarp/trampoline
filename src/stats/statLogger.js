function header(...args) {
  console.log('\u001b[34mStats\u001b[37m\u001b[01m ***', ...args, '***\u001b[00m');
}

function info(...args) {
  console.log('\u001b[34mStats\u001b[37m', ...args);
}

function warn(...args) {
  console.log('\u001b[34mStats\u001b[93m warning!\u001b[37m', ...args);
}

module.exports = {
  header,
  info,
  warn,
};
