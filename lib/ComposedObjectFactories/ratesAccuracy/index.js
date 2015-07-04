var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var fs = require('fs');

var AccuracyReport = require('./accuracyReport');
var hotelData = require('./hotelData');
var ScraperLookup = require('./scraperLookup');

function buildKey(logEntry) {
	if(!logEntry) {
		return '';
	}

	var date;

	if(/^[0-9]+$/.exec(logEntry.url_querystring_date)) {
		date = moment.unix(logEntry.url_querystring_date).format("YYYY-MM-DD");
	}
	else {
		date = logEntry.url_querystring_date;
	}

	var key = logEntry['url_querystring_searchId'] +
			logEntry['url_querystring_hotelId'] +
			date +
			logEntry['url_querystring_nights'] +
			logEntry['url_querystring_adults'] +
			logEntry['url_querystring_children'];

	return 	key;
}

function processLogEntries(hotelData, logEntries) {
	return new Promise(function(resolve) {
		var AccuracyReportWithHotelDetails = AccuracyReport.bind(undefined, hotelData);
		var accuracyReports = [];
		var currentSearch;
		var lastHotelDetails;
		var accuracyReportForSearch;
		var serverSearchContext;

		while(logEntries.length) {
			var currentEntry = logEntries.shift();
			var isAccuracyReport = currentEntry.url.indexOf('/beacon/hotelDetailsAccuracy') > 0;
			var isSearchRequest = _.get(currentEntry, 'req_headers.Referer', '').indexOf('hotel-reservations') < 0;

			if(!isAccuracyReport && currentEntry.url_page_type === 'search') {
				serverSearchContext = currentEntry;
				continue;
			}

			if(isSearchRequest) {
				currentSearch = currentEntry;
				accuracyReportForSearch = 0;
				continue;
			}

			if(currentSearch && buildKey(currentSearch) === buildKey(currentEntry)) {
				accuracyReportForSearch++;
				lastHotelDetails = null;

				if(serverSearchContext && serverSearchContext.resp_headers && serverSearchContext.resp_headers.x_debug_search_id !== currentSearch['url_querystring_searchId']) {
					serverSearchContext = null;
				}
				accuracyReports.push(new AccuracyReportWithHotelDetails(currentSearch, serverSearchContext, currentEntry, accuracyReportForSearch));
			}
			else {
				lastHotelDetails = currentEntry;
			}
		}

		if(currentSearch && !accuracyReportForSearch) {
			accuracyReports.push(new AccuracyReportWithHotelDetails(currentSearch, serverSearchContext, (buildKey(currentSearch) === buildKey(lastHotelDetails) ? lastHotelDetails : undefined), 1));
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
		var hotelIds = _.chain(events).pluck('url_querystring_hotelId').filter(function(hotelId) { return hotelId; }).value();

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
	var scraperLookup = new ScraperLookup();

	var build = buildObject.bind(undefined, logEntries);

	return extractHotelIds(logEntries.events)
		.then(hotelData.getForIds)
		.then(scraperLookup.addScraperData)
		.then(build);
};
