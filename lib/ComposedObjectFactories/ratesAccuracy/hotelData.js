var Promise = require('bluebird');
var _ = require('lodash');

var ComposerConfig = require('../../config');

module.exports = {
	getForIds: function lookupHotelData(hotelIds) {
		return Promise.all(_.map(hotelIds, function(hotelId) {
				return ComposerConfig.lookupStore('redis')
			.then(function(store) {
				return store.getJsonForKey('hotel_' + hotelId);
			})
			.then(function(data) {
				return new Promise(function(resolve) {
					resolve({
						id: hotelId,
						data: data
					});
				});
			});
		})).then(function(data) {
			return new Promise(function(resolve, reject) {
				resolve(_.reduce(data, function(allItems, item) {
					allItems[item.id.toString('utf-8')] = item.data;
					return allItems;
				}, {}));
			});
		});
	}
};
