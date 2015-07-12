var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var _ = require('lodash');
var logging = require('../logging');
var logger = logging.forModule('Config');
var eventEmitter = require("../events");

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
	return new allListeners[listenerConfig.type](eventEmitter, logging, listenerConfig);
}

function createPublisherFromConfig(config){
	if(!allPublishers[config.type]) {
		return reject(new Error('Could not find publisher of type: ' + config.type));
	}

	return new allPublishers[config.type](config);
}

function load(config) {
	return new Promise(function(resolve, reject) {
		allStores = _.reduce(config.stores, createStoreFromConfig, {});
		var listeners = _.map(config.listeners, createListenerFromConfig);
		var publishers = _.map(config.publishers, createPublisherFromConfig);

		var allModules = _.map(allStores, function(store) { return store; }).concat(listeners, publishers);

		startHandlers = _.chain(allModules).pluck('start').filter(function(startHandler) { return startHandler; }).value();
		stopHandlers = _.chain(allModules).pluck('stop').filter(function(stopHandler) { return stopHandler; }).value();

		_.each(config.loggers, function(logger) {
			logging.registerLogger(logger);
		});

		resolve({
			listeners: listeners, 
			publishers: publishers,
			stores: allStores
		});
	});
}

function executeHandlers(handlers) {
	return handlers.map(function(handler) { return handler(); });
}

module.exports = {
	load: load,
	loadFromFile: function(file) {
		return loadFromFile(file).then(load);
	},
	lookupStore: function(storeName) {
		return new Promise(function(resolve, reject) {
			if(!allStores[storeName]) {
				return reject(new Error('Store "' + storeName + '" not found'));
			}

			resolve(allStores[storeName]);
		});
	},
	startConfiguredModules: function() {
		logger.logInfo('Starting ' + startHandlers.length + ' module handler' + (startHandlers.length !== 1 ? 's' : ''));

		return Promise.all(executeHandlers(startHandlers));
	},
	stopConfiguredModules: function() {
		logger.logInfo('Stopping ' + stopHandlers.length + ' module handler' + (stopHandlers.length !== 1 ? 's' : ''));
		
		return Promise.all(executeHandlers(stopHandlers));
	}
};
