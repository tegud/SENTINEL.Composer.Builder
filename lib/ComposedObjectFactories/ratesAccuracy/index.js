var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var ComposerConfig = require('../../config')

var AccuracyReport = require('./accuracyReport')

function processLogEntries(hotelData, logEntries) {
	var AccuracyReportWithHotelDetails = AccuracyReport.bind(undefined, hotelData);

	return new Promise(function(resolve) {
		var accuracyReports = [];
		var currentSearch;
		var lastHotelDetails;
		var accuracyReportForSearch;

		while(logEntries.length) {
			var currentEntry = logEntries.shift();
			var isSearchRequest = _.get(currentEntry, 'req_headers.Referer', '').indexOf('hotel-reservations') < 0;

			if(isSearchRequest) {
				currentSearch = currentEntry;
				accuracyReportForSearch = 0;
				continue;
			}

			if(currentSearch) {
				accuracyReportForSearch++;
				lastHotelDetails = null;
				accuracyReports.push(new AccuracyReportWithHotelDetails(currentSearch, currentEntry, accuracyReportForSearch));
			}
			else {
				lastHotelDetails = currentEntry;
			}
		}

		if(currentSearch && !accuracyReportForSearch) {
			accuracyReports.push(new AccuracyReportWithHotelDetails(currentSearch, lastHotelDetails, 1));
		}

		resolve(accuracyReports);
	});
}

function extractHotelIds(events) {
	return new Promise(function(resolve) {
		var hotelIds = _.chain(events).map(function(event) { return event['url_querystring_hotelId']; }).filter(function(hotelId) { return hotelId; }).value();

		resolve(hotelIds);
	});
}

function getHotelData(events) {
	return extractHotelIds(events)
    	.then(function(hotelIds) {
			if(hotelIds.length) {
				return lookupHotelData(hotelIds);
			}
			else {
				return new promise(function(resolve) { resolve(); });
			}
		});
}

function lookupHotelData(hotelIds) {
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

function buildObject(logEntries, hotelInfo) {
	var sortedLogEntries = _.sortBy(logEntries.events.slice(0), function(ev) {
        return moment(ev['@timestamp']).valueOf();
    });

	return processLogEntries(hotelInfo, sortedLogEntries).then(function(accuracyReports) {
		return new Promise(function(resolve) {
			if(!accuracyReports.length) {
				return resolve({});
			}
			else if(accuracyReports.length === 1) {
				return resolve(accuracyReports[0]);
			}

			resolve(accuracyReports);
		});
	});
}

module.exports = function(logEntries) {
	return getHotelData(logEntries.events)
		.then(buildObject.bind(undefined, logEntries));
};
