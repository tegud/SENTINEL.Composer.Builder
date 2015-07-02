var moment = require('moment');
var _ = require('lodash');

function generateDataText(data) {
	if(!data) {
		return '';
	}

	return ', ' + _.chain(data).filter(function(value) { value; }).map(function(value, key) {
		return key + ': ' + value;
	}).value().join(', ');
}

module.exports = function ConsoleLogger() {
	return function logToConsole(level, module, message, data) {
		console.log('[' + moment().format() + '] [' + level + ']' + (module ? ' [' + module + ']' : '') + ' ' + message + generateDataText(data));
	}
}
