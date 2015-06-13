var Promise = require('bluebird');
var dgram = require("dgram");
var _ = require('lodash');
var logger = require('./logging');
var allListeners = require('./listeners');
var allPublishers = require('./publishers');
var ComposerConfig = require('./config');

function parseMessage(msg) {
	var data = msg.toString('utf-8');

	return JSON.parse(data);
}

function publish(publishers, data) {
	_.each(publishers, function(publisher) {
		publisher.publish(data);
	});
}

function getModuleStartPromise(module) {
	return module.start();
}

function startUp(allModules) {
	var moduleStartPromises = _.map(allModules, getModuleStartPromise);
	logger.logInfo('Initialising Composer Builder.');

	return Promise.all(moduleStartPromises).then(function() { 
		logger.logInfo('Composer Builder Running...');

		return new Promise(function(resolve, reject) { resolve(); }) 
	});
}

module.exports = function(config) {
	var configLoadedComplete;
	var listeners = [];
	var publishers = [];
	var stores = [];

	function assignConfig (configuredModules) {
		return new Promise(function(resolve, reject) {
			listeners = _.map(configuredModules.listeners, function(listener) {
				return new listener(handleMessage);
			});

			publishers = configuredModules.publishers;
			stores = configuredModules.stores;

			logger.logInfo('Configuration complete.');

			resolve(listeners.concat(publishers));
		});
	}

	if(config) {
		configLoadedComplete = ComposerConfig.load(config).then(assignConfig);
	}

	function handleMessage(msg) {
		var parsedData = parseMessage(msg);

		stores[parsedData.store.name].getSessionList(parsedData).then(buildObject.bind(undefined, parsedData));
	}

	function buildObject(parsedData, logs) {
		return new Promise(function (resolve, reject) {
			var aggregator = require('./ComposedObjectFactories/' + parsedData.aggregatorType);
			var builtObject = aggregator({ events: _.map(logs, function(log) { return JSON.parse(log); }) });

			publish(publishers, builtObject);

			resolve(builtObject);
		}); 
	}

	return {
		loadConfigFromFile: function(fileLocation) {
			return configLoadedComplete = ComposerConfig.loadFromFile(fileLocation).then(assignConfig);
		},
		start: function() {
			return configLoadedComplete
				.then(startUp)
				.catch(SyntaxError, function (e) {
					logger.logError("File contains invalid json");
				}).catch(Promise.OperationalError, function (e) {
					logger.logError("Unable to read file, because: " + e.message);
				}).catch(function(e) {
					logger.logError('Configuration load failed: ' + e.message);
				});

		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				var allModules = listeners.concat(publishers).concat(_.map(stores, function(module) { return module; }));
				var moduleStopPromises = _.chain(allModules).map(function(module) {
					if(!module.stop) {
						return;
					}

					return module.stop();
				}).filter(function(module) { return module; }).value();

				Promise.all(moduleStopPromises).then(function() { resolve(); });
			});
		}
	};
};
