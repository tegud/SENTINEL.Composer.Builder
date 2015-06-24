var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var fs = require('fs');

var AccuracyReport = require('./accuracyReport');
var hotelData = require('./hotelData');

function processLogEntries(hotelData, logEntries) {
	return new Promise(function(resolve) {
		var AccuracyReportWithHotelDetails = AccuracyReport.bind(undefined, hotelData);
		var accuracyReports = [];
		var currentSearch;
		var lastHotelDetails;
		var accuracyReportForSearch;

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

		while(logEntries.length) {
			var currentEntry = logEntries.shift();
			var isSearchRequest = _.get(currentEntry, 'req_headers.Referer', '').indexOf('hotel-reservations') < 0;

			if(currentEntry.url.indexOf('/beacon/hotelDetailsAccuracy') < 0) {
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
				accuracyReports.push(new AccuracyReportWithHotelDetails(currentSearch, currentEntry, accuracyReportForSearch));
			}
			else {
				lastHotelDetails = currentEntry;
			}
		}

		if(currentSearch && !accuracyReportForSearch) {
			accuracyReports.push(new AccuracyReportWithHotelDetails(currentSearch, (buildKey(currentSearch) === buildKey(lastHotelDetails) ? lastHotelDetails : undefined), 1));
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

function ScraperLookup() {
	var scraperLookup;

	function loadScraperDetails() {
		return new Promise(function(resolve, reject) {
			fs.readFile(__dirname + '/data/scrapers.json', 'utf-8', function(err, data) {
				var parsedData = JSON.parse(data);

				resolve(scraperLookup = _.reduce(parsedData, function(allLookups, currentItem) {
					allLookups[currentItem.hotelId] = currentItem.scraperName;

					return allLookups;
				}, {}));
			});
		});
	}

	function getScraperForHotelId(hotelId) {
		return new Promise(function(resolve, reject) {
			resolve(scraperLookup[hotelId]);
		});
	}

	function lookupScraperDetails(hotelId) {
		if(!scraperLookup) {
			return loadScraperDetails().then(getScraperForHotelId.bind(undefined, hotelId));
		}

		return getScraperForHotelId(hotelId);
	}

	function addScraperData(hotelInfo) {
		var allPromises = _.chain(hotelInfo).map(function(hotel, id) {
			if(!hotel) { 
				return ; 
			}

			return lookupScraperDetails(id).then(function(scraperName) {
				return new Promise(function(resolve) {
					hotel.usesScreenScraper = scraperName ? true : false;
					hotel.scraperName = scraperName;

					resolve(hotel);
				});
			});
		}).filter(function(hotel) { return hotel; }).value();

		return Promise.all(allPromises).then(function() {
			return new Promise(function(resolve, reject) {
				resolve(hotelInfo);
			});
		});
	}

	return {
		addScraperData: addScraperData
	};
}

module.exports = function ratesAccuracyAggregator(logEntries) {
	var scraperLookup = new ScraperLookup();

	var build = buildObject.bind(undefined, logEntries);

	return extractHotelIds(logEntries.events)
		.then(hotelData.getForIds)
		.then(scraperLookup.addScraperData)
		.then(build);
};
