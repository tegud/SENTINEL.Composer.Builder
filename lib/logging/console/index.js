var moment = require('moment');
var _ = require('lodash');
var writeToConsole = require('./writeToConsole');

function generateDataText(data) {
	if(!data) {
		return '';
	}

	var kvpStrings = _.chain(data).map(function(value, key) {
		if(!value) { 
			return;
		}

		return key + ': ' + value;
	}).filter(function(value) { return value; }).value();

	if(!kvpStrings.length) { return; }

	return ', ' + kvpStrings.join(', ');
}

module.exports = function ConsoleLogger() {
	return function logToConsole(level, module, message, data) {
		writeToConsole('[' + moment().format() + '] [' + level + ']' + (module ? ' [' + module + ']' : '') + ' ' + message + generateDataText(data));
	}
}
