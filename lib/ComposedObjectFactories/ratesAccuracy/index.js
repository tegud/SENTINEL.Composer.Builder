var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

var AccuracyReport = require('./accuracyReport');
var hotelData = require('./hotelData');

function processLogEntries(hotelData, logEntries) {
	return new Promise(function(resolve) {
		var AccuracyReportWithHotelDetails = AccuracyReport.bind(undefined, hotelData);
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

		if(accuracyReports.length === 1) {
			resolve(accuracyReports[0]);
		}
		else if (accuracyReports.length > 1) {
			resolve(accuracyReports);
		}
		
		return resolve({});
	});
}

function extractHotelIds(events) {
	return new Promise(function(resolve) {
		var hotelIds = _.chain(events).map(function(event) { return event['url_querystring_hotelId']; }).filter(function(hotelId) { return hotelId; }).value();

		resolve(hotelIds);
	});
}

function buildObject(logEntries, hotelInfo) {
	var sortedLogEntries = _.sortBy(logEntries.events.slice(0), function(ev) {
        return moment(ev['@timestamp']).valueOf();
    });

	return processLogEntries(hotelInfo, sortedLogEntries);
}

module.exports = function ratesAccuracyAggregator(logEntries) {
	var build = buildObject.bind(undefined, logEntries);

	return extractHotelIds(logEntries.events)
		.then(hotelData.getForIds)
		.then(build);
};
