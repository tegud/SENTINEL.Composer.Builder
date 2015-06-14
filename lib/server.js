var Promise = require('bluebird');
var dgram = require("dgram");
var events = require("events");
var _ = require('lodash');
var logger = require('./logging');
var allListeners = require('./listeners');
var allPublishers = require('./publishers');
var ComposerConfig = require('./config');

var aggregators = require('./ComposedObjectFactories');

function startUp(eventEmitter, allModules) {
	logger.logInfo('Initialising Composer Builder.');

	return ComposerConfig.startConfiguredModules(eventEmitter).then(function() { 
		logger.logInfo('Composer Builder Running...');

		return new Promise(function(resolve, reject) { resolve(); }) 
	});
}

function getEventLogForExpiredKey(parsedData, store) {
	return store.getSessionList(parsedData);
}

var emitObjectReadyEvent = function(eventEmitter, builtObject) {
	eventEmitter.emit('eventReadyToPublish', builtObject);
};

module.exports = function(config) {
	var configLoadedComplete;
	var eventEmitter = new events.EventEmitter();
	var publishEvent =  emitObjectReadyEvent.bind(undefined, eventEmitter);

	if(config) {
		configLoadedComplete = ComposerConfig.load(config);
	}
	
	eventEmitter.on('listenerEventReceived', handleMessage.bind(undefined, publishEvent));

	function handleMessage(publishEvent, parsedData) {
		var buildEvent = aggregators.compose.bind(undefined, parsedData);
		var getEventLog = getEventLogForExpiredKey.bind(undefined, parsedData);

		ComposerConfig.lookupStore(parsedData.store.name)
			.then(getEventLog)
			.then(buildEvent)
			.then(publishEvent);
	}

	return {
		loadConfigFromFile: function(fileLocation) {
			return configLoadedComplete = ComposerConfig.loadFromFile(fileLocation);
		},
		start: function() {
			return configLoadedComplete
				.then(startUp.bind(undefined, eventEmitter))
				.catch(SyntaxError, function (e) {
					logger.logError("File contains invalid json");
				}).catch(Promise.OperationalError, function (e) {
					logger.logError("Unable to read file, because: " + e.message);
				}).catch(function(e) {
					logger.logError('Configuration load failed: ' + e.message);
				});

		},
		stop: ComposerConfig.stopConfiguredModules
	};
};
