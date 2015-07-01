var moment = require('moment');

module.exports = function ConsoleLogger() {
	return function logToConsole(level, module, message) {
		console.log('[' + moment().format() + '] [' + level + ']' + (module ? ' [' + module + ']' : '') + ' ' + message);
	}
}
