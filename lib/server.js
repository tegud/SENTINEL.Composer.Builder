var Promise = require('bluebird');
var dgram = require("dgram");
var eventEmitter = require("./events");
var _ = require('lodash');
var logger = require('./logging');
var ComposerConfig = require('./config');

var aggregators = require('./ComposedObjectFactories');

function startUp(allModules) {
	logger.logInfo('Initialising Composer Builder.');

	eventEmitter.on('listenerEventReceived', handleMessage);

	return ComposerConfig.startConfiguredModules(eventEmitter)
		.then(startupComplete)
		.catch(SyntaxError, function (e) {
			logger.logError.bind("File contains invalid json");
		}).catch(Promise.OperationalError, function (e) {
			logger.logError("Unable to read file, because: " + e.message);
		}).catch(function(e) {
			logger.logError('Configuration load failed: ' + e.message);
		});
}

function startupComplete() {
	return new Promise(function(resolve, reject) { 
		logger.logInfo('Composer Builder Running...');
		resolve(); 
	}); 
}

function getEventLogForExpiredKey(parsedData, store) {
	return store.getSessionList(parsedData);
}

function publishEvent(builtObject) {
	if(!builtObject) {
		return;
	}

	if(_.isArray(builtObject)) {
		return _.each(builtObject, function(currentObject) {
			eventEmitter.emit('eventReadyToPublish', currentObject);
		});
	}

	eventEmitter.emit('eventReadyToPublish', builtObject);
}

function handleMessage(parsedData) {
	var buildEvent = aggregators.compose.bind(undefined, parsedData);
	var getEventLog = getEventLogForExpiredKey.bind(undefined, parsedData);

	ComposerConfig.lookupStore(parsedData.store.name)
		.then(getEventLog)
		.then(buildEvent)
		.then(publishEvent);
}

function stop(listenerEventCallback) {
	return ComposerConfig.stopConfiguredModules().then(function() {
		return new Promise(function(resolve, reject) {
			eventEmitter.removeListener('listenerEventReceived', handleMessage);
			resolve();
		})
	});
}

module.exports = function() {
	return {
		loadConfig: ComposerConfig.load,
		loadConfigFromFile: ComposerConfig.loadFromFile,
		start: startUp,
		stop: stop
	};
};
