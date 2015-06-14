var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var _ = require('lodash');
var logger = require('../logging');
var allListeners = require('../listeners');
var allPublishers = require('../publishers');

var allStores = {};
var startHandlers = [];
var stopHandlers = [];

function loadFromFile(file) {
	return fs.readFileAsync(file).then(JSON.parse);
}

function createStoreFromConfig(allStores, storeConfig, storeName) {
	allStores[storeName] = require('../stores/' + storeConfig.type)(storeConfig);

	return allStores;
}

function createListenerFromConfig(listenerConfig) {
	if(!allListeners[listenerConfig.type]) {
		return reject(new Error('Could not find listener of type: ' + listenerConfig.type));
	}
	return new allListeners[listenerConfig.type](listenerConfig);
}

function createPublisherFromConfig(config){
	if(!allPublishers[config.type]) {
		return reject(new Error('Could not find publisher of type: ' + config.type));
	}

	return new allPublishers[config.type](config);
}

function load(config) {
	return new Promise(function(resolve, reject) {
		if(config.logLevel) {
			logger.setLevel(config.logLevel);
		}

		allStores = _.reduce(config.stores, createStoreFromConfig, {});
		var listeners = _.map(config.listeners, createListenerFromConfig);
		var publishers = _.map(config.publishers, createPublisherFromConfig);

		var allModules = _.map(allStores, function(store) { return store; }).concat(listeners, publishers);

		startHandlers = _.chain(allModules).pluck('start').filter(function(stopHandler) { return stopHandler; }).value();
		stopHandlers = _.chain(allModules).pluck('stop').filter(function(stopHandler) { return stopHandler; }).value();

		resolve({
			listeners: listeners, 
			publishers: publishers,
			stores: allStores
		});
	});
}

module.exports = {
	load: load,
	loadFromFile: function(file) {
		return loadFromFile(file)
			.then(load);
	},
	lookupStore: function(storeName) {
		return new Promise(function(resolve, reject) {
			if(!allStores[storeName]) {
				return reject(new Error('Store "' + storeName + '" not found'));
			}

			resolve(allStores[storeName]);
		});
	},
	startConfiguredModules: function(eventEmitter) {
		return Promise.all(startHandlers.map(function(handler) { return handler(eventEmitter); }));
	},
	stopConfiguredModules: function() {
		return Promise.all(stopHandlers.map(function(handler) { return handler(); }));
	}
};
