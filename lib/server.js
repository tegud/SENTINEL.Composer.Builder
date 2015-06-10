var Promise = require('bluebird');
var dgram = require("dgram");
var _ = require('lodash');
var logger = require('./logging');
var allListeners = require('./listeners');
var allPublishers = require('./publishers');

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

module.exports = function(config) {
	if(config.logLevel) {
		logger.setLevel(config.logLevel);
	}

	var listeners = _.map(config.listeners, function(config) {
		return new allListeners[config.type](config, handleMessage);
	});

	var publishers = _.map(config.publishers, function(config) {
		return new allPublishers[config.type](config);
	});
	
	var stores = _.reduce(config.stores, function(allStores, storeConfig, storeName) {
		allStores[storeName] = require('./stores/' + storeConfig.type)(storeConfig);

		return allStores;
	}, {});

	function handleMessage(msg) {
		var parsedData = parseMessage(msg);

		var aggregator = require('./ComposedObjectFactories/' + parsedData.aggregatorType);

		stores[parsedData.store.name].getSessionList(parsedData).then(function(logs) {
			var builtObject = aggregator({ events: _.map(logs, function(log) { return JSON.parse(log); }) });

			publish(publishers, builtObject);
		});
	}

	return {
		start: function() {
			logger.logInfo('Initialising SENTINEL.Composer.');

			return new Promise(function(resolve, reject) {
				var moduleStartPromises = _.map(listeners.concat(publishers), getModuleStartPromise);

				Promise.all(moduleStartPromises).then(resolve.bind(undefined, undefined));
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
