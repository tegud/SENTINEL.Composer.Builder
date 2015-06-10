var _ = require('lodash');
var moment = require('moment');
var redis = require('redis');
var Promise = require('bluebird');

module.exports = function(config) {
	var client = redis.createClient(config.port, config.host);

	return {
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
		}
	};
};
