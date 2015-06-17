var Promise = require('bluebird');
var dgram = require("dgram");
var eventEmitter = require("./events");
var _ = require('lodash');
var logger = require('./logging');
var ComposerConfig = require('./config');

var aggregators = require('./ComposedObjectFactories');

function startUp(allModules) {
	logger.logInfo('Initialising Composer Builder.');

	return ComposerConfig.startConfiguredModules(eventEmitter)
		.then(function() { 
			return new Promise(function(resolve, reject) { 
				logger.logInfo('Composer Builder Running...');
				resolve(); 
			}); 
		})
		.catch(SyntaxError, function (e) {
			logger.logError("File contains invalid json");
		}).catch(Promise.OperationalError, function (e) {
			logger.logError("Unable to read file, because: " + e.message);
		}).catch(function(e) {
			logger.logError('Configuration load failed: ' + e.message);
		});
}

function getEventLogForExpiredKey(parsedData, store) {
	return store.getSessionList(parsedData);
}

function publishEvent(builtObject) {
	if(!builtObject) {
		return;
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

module.exports = function(config) {
	var configLoadedComplete;

	if(config) {
		configLoadedComplete = ComposerConfig.load(config);
	}
	
	eventEmitter.on('listenerEventReceived', handleMessage);

	return {
		loadConfigFromFile: function(fileLocation) {
			return configLoadedComplete = ComposerConfig.loadFromFile(fileLocation);
		},
		start: function() {
			return configLoadedComplete.then(startUp);
		},
		stop: stop
	};
};
