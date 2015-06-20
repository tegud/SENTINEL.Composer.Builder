var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
	compose: function buildObject(parsedData, logs) {
		return new Promise(function (resolve, reject) {
			if(!logs.length) {
				return resolve();
			}

			var aggregator = require('./' + parsedData.aggregatorType);
			var builtObject = aggregator({ events: _.map(logs, function(log) { return JSON.parse(log); }) });

			if(typeof builtObject.then === '') {
				return builtObject.then(resolve);
			}

			resolve(builtObject);
		}); 
	}
};
