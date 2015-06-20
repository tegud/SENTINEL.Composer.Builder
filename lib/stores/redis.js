var _ = require('lodash');
var moment = require('moment');
var redis = require('redis');
var Promise = require('bluebird');
var logger = require('../logging').forModule('Redis Store');

module.exports = function(config) {
	var client;

	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				logger.logInfo('Connecting to redis store on: ' + config.host + ':' + config.port);

				client = redis.createClient(config.port, config.host, { max_attempts: 5 });	

				client.on('ready', function() {
					logger.logInfo('Connected to redis store on: ' + config.host + ':' + config.port);

					resolve();
				});

				client.on('error', function(err) {
					logger.logError('Redis Error: ' + err);

					return reject(new Error('Error connecting to redis store on: ' + config.host + ':' + config.port + ', ' + err.message));
				});
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				client.quit();

				resolve();
			});
		},
		getSessionList: function(expiredKey) {
			return new Promise(function(resolve, reject) {
				client.lrange(expiredKey.store.eventListKey, 0, -1, function(err, logs) {
					if(err) {
						return reject(err);
					}

					client.del(expiredKey.store.eventListKey);

					resolve(logs);
				});
			});
		},
		getJsonForKey: function(key) {
			return new Promise(function(resolve, reject) {
				client.get(key, function(err, data) {
					if(err) {
						logger.logError('Error retrieving key: ' + key + ', ' + err.message);
						return resolve();
					}

					try {
						resolve(JSON.parse(data));
					}
					catch(ex) {
						logger.logError('Value was invalid JSON: ' + key + ', ' + err.message);
						return resolve();
					}
				});
			});
		}
	};
};
