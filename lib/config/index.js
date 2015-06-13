var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var _ = require('lodash');
var logger = require('../logging');
var allListeners = require('../listeners');
var allPublishers = require('../publishers');

function loadFromFile(file) {
	return fs.readFileAsync(file).then(JSON.parse);
}

function load(config) {
	return new Promise(function(resolve, reject) {
		if(config.logLevel) {
			logger.setLevel(config.logLevel);
		}

		var builtConfig = {
			listeners: _.map(config.listeners, function(listenerConfig) {
				if(!allListeners[listenerConfig.type]) {
					return reject(new Error('Could not find listener of type: ' + listenerConfig.type));
				}
				return allListeners[listenerConfig.type].bind(undefined, listenerConfig);
			}), 
			publishers: _.map(config.publishers, function(config) {
				if(!allPublishers[config.type]) {
					return reject(new Error('Could not find publisher of type: ' + config.type));
				}

				return new allPublishers[config.type](config);
			}),
			stores: _.reduce(config.stores, function(allStores, storeConfig, storeName) {
				allStores[storeName] = require('../stores/' + storeConfig.type)(storeConfig);

				return allStores;
			}, {})
		};

		resolve(builtConfig);
	});
}

module.exports = {
	load: load,
	loadFromFile: function(file) {
		return loadFromFile(file)
			.then(load);
	}
};
