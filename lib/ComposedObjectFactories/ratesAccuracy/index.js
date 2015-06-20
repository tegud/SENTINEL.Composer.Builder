var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var ComposerConfig = require('../../config')

module.exports = function(logEntries) {
	var accuracyReports = [];

	function createAccuracyReport(hotelData, search, hotelDetails, accuracyReportNumber) {
		var hotelId = parseInt(search['url_querystring_hotelId'], 10);
		var nights = parseInt(search['url_querystring_nights'], 10);
		var adults = parseInt(search['url_querystring_adults'], 10);
		var children = parseInt(search['url_querystring_children'], 10);

		var searchRate;
		var hotelDetailsRate;

		if(search['url_querystring_rate']) {
			searchRate = parseFloat(search['url_querystring_rate']);
		}
		else {
			searchRate = 'Unknown';
		}

		if(hotelDetails && hotelDetails['url_querystring_rate']) {
			hotelDetailsRate = parseFloat(hotelDetails['url_querystring_rate']);
		}
		else {
			hotelDetailsRate = 'Unknown';
		}

		var baseObject = {
			type: 'rates_accuracy_result',
			'@timestamp': hotelDetails ? hotelDetails['@timestamp'] : search['@timestamp'],
			hotelId: hotelId,
			searchId: search.url_querystring_searchId,
			date: moment.unix(search.url_querystring_date).format("YYYY-MM-DD"),
			nights: nights,
			adults: adults,
			children: children,
			searchRate: searchRate,
			hotelDetailsRate: hotelDetailsRate,
			number: accuracyReportNumber,
			hotelDetailsPresent: hotelDetails ? true : false
		};

		if(hotelData[hotelId]) {
			baseObject.hotelDetails = hotelData[hotelId];
		}

		if(searchRate !== 'Unknown' && hotelDetailsRate !== 'Unknown') {
			baseObject.rateDifference = (searchRate - hotelDetailsRate).toFixed(2);
			baseObject.rateDifferencePercentage = ((searchRate / hotelDetailsRate) * 100).toFixed(2);
			baseObject.availabilityStatus = 'OK';
		}
		else if (searchRate === 'Unknown' && hotelDetailsRate !== 'Unknown'){
			baseObject.availabilityStatus = 'ERROR';
			baseObject.availabilityMissing = 'Search';

		}
		else if (searchRate !== 'Unknown' && hotelDetailsRate === 'Unknown'){
			baseObject.availabilityStatus = 'ERROR';
			baseObject.availabilityMissing = 'HotelDetails';
		}
		else {
			baseObject.availabilityStatus = 'OK';
			baseObject.availabilityMissing = 'SearchAndHotelDetails';
		}

		return baseObject;
	}

	function processLogEntries(hotelData, logEntries) {
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
				accuracyReports.push(createAccuracyReport(hotelData, currentSearch, currentEntry, accuracyReportForSearch));
			}
			else {
				lastHotelDetails = currentEntry;
			}
		}

		if(currentSearch && !accuracyReportForSearch) {
			accuracyReports.push(createAccuracyReport(hotelData, currentSearch, lastHotelDetails, 1));
		}
	}

    function getHotelData(events) {
    	return new Promise(function(resolve) {
    		var hotelIds = _.chain(events).map(function(event) { return event['url_querystring_hotelId']; }).filter(function(hotelId) { return hotelId; }).value();

    		resolve(hotelIds);
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

	return getHotelData(logEntries.events)
		.then(function(hotelIds) {
			if(hotelIds.length) {
				return lookupHotelData(hotelIds);
			}
			else {
				return new promise(function(resolve) { resolve(); });
			}
		})
		.then(function(hotelInfo) {
			processLogEntries(hotelInfo, _.sortBy(logEntries.events.slice(0), function(ev) {
		        return moment(ev['@timestamp']).valueOf();
		    }));

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
};
