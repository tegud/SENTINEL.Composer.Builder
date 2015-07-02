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

function buildViewModel(level, module, message, data) {
	return {
		date: moment().format(),
		level: level,
		message: message,
		dataText: generateDataText(data),
		module: module
	};
}

function logToConsole(template, level, module, message, data) {
	var viewModel = buildViewModel(level, module, message, data);

	writeToConsole(template(viewModel));
}

module.exports = function ConsoleLogger() {
	return logToConsole.bind(undefined, _.template('[<%= date %>] [<%= level %>]<% if(module) { print(" [" + module + "]"); } %> <%= message %><%= dataText %>'));
}
