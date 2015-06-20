var Promise = require('bluebird');
var _ = require('lodash');

var ComposerConfig = require('../../config');

function lookupHotelIdInStore(hotelId, store) {
	var key = 'hotel_' + hotelId;
	return store.getJsonForKey(key);
}

function createResult(hotelId, data) {
	return new Promise(function(resolve) {
		resolve({
			id: hotelId,
			data: data
		});
	});
}

function getHotelDetails(hotelId) {
	return ComposerConfig.lookupStore('redis')
		.then(lookupHotelIdInStore.bind(undefined, hotelId))
		.then(createResult.bind(undefined, hotelId));
}

function getHotelIdPromises(hotelIds) {
	return _.map(hotelIds, getHotelDetails);	
}

function reduceResult(data) {
	return new Promise(function(resolve, reject) {
		resolve(_.reduce(data, function(allItems, item) {
			allItems[item.id.toString('utf-8')] = item.data;
			return allItems;
		}, {}));
	});
}

module.exports = {
	getForIds: function lookupHotelData(hotelIds) {
		return Promise.all(getHotelIdPromises(hotelIds)).then(reduceResult);
	}
};
