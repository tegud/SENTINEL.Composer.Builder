var fs = require('fs');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function ScraperLookup() {
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
};
