var moment = require('moment');
var _ = require('lodash');

var DEBUG = 'DEBUG';
var INFO = 'INFO';
var ERROR = 'ERROR';

var availableLevels = {};

availableLevels[DEBUG] = 0;
availableLevels[INFO] = 1;
availableLevels[ERROR] = 2;

var loggers = [CreateLogger({
	name: 'default',
	type: 'console',
	level: INFO
})];

function CreateLogger(config) {
	if(!config.logger) {
		config.logger = require('./' + config.type);
	}

	return {
		level: config.level,
		name: config.name,
		logger: new config.logger(config)
	};
}

function log(level, module, message) {
	var matchingLoggers = _.chain(loggers)
		.filter(function(currentLogger) {
			return availableLevels[level] >= availableLevels[currentLogger.level];
		})
		.pluck('logger')
		.each(function(loggingFunction) {
			loggingFunction(level, module, message);
		}).value();
}

function buildLogger(module) {
	return {
		logDebug: log.bind(undefined, DEBUG, module),
		logInfo: log.bind(undefined, INFO, module),
		logError: log.bind(undefined, ERROR, module)
	};
}

function registerLogger(config, logger) {
	if(logger) {
		config.logger = logger;
	}

	loggers.push(CreateLogger(config));
}

function setLoggerLevel(logger, level) {
	var matchedLogger = _.chain(loggers).filter(function(currentLogger) {
		return currentLogger.name === logger;
	}).first().value();

	if(!matchedLogger) {
		return;
	}

	matchedLogger.level = level;
}

module.exports = _.merge({
		registerLogger: registerLogger, 
		removeAll: function() {
			loggers = [];
		},
		setLoggerLevel: setLoggerLevel,
		log: log,
		forModule: buildLogger
	}, 
	buildLogger());
