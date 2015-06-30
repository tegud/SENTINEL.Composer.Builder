var moment = require('moment');
var _ = require('lodash');

var DEBUG = 'DEBUG';
var INFO = 'INFO';
var ERROR = 'ERROR';

var availableLevels = {};

availableLevels[DEBUG] = 0;
availableLevels[INFO] = 1;
availableLevels[ERROR] = 2;

var logLevel = 'INFO';

var loggers = [];

function CreateLogger(config) {
	return {
		level: config.level,
		logger: new loggerModules[config.type](config)
	};
}

var loggerModules = {
	console: ConsoleLogger
};

function ConsoleLogger() {
	return function logToConsole(level, module, message) {
		console.log('[' + moment().format() + '] [' + level + ']' + (module ? ' [' + module + ']' : '') + ' ' + message);
	}
}

function log(level, module, message) {
	var matchingLoggers = _.chain(loggers, function(currentLogger) {
		return availableLevels[level] >= availableLevels[currentLogger.level];
	}).pluck('logger').map(function(loggingFunction) {
		return loggingFunction.bind(undefined, level, module, message);
	}).value();

	_.each(matchingLoggers, function(logger) {
		logger();
	});
}

function buildLogger(module) {
	return {
		logDebug: log.bind(undefined, DEBUG, module),
		logInfo: log.bind(undefined, INFO, module),
		logError: log.bind(undefined, ERROR, module)
	};
}

loggers = [CreateLogger({
	type: 'console',
	level: 'INFO'
})]

module.exports = _.merge({
		setLevel: function(level) {
			logLevel = level;
		},
		log: log,
		forModule: buildLogger
	}, 
	buildLogger());
