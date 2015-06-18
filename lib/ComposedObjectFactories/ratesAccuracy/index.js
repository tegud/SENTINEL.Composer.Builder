var _ = require('lodash');
var moment = require('moment');

module.exports = function(logEntries) {
	var accuracyReports = [];

	function createAccuracyReport(search, hotelDetails, accuracyReportNumber) {
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
			number: accuracyReportNumber
		};

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

	function processLogEntries(logEntries) {
		var currentSearch;
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
				accuracyReports.push(createAccuracyReport(currentSearch, currentEntry, accuracyReportForSearch));
			}
		}

		if(currentSearch && !accuracyReportForSearch) {
			accuracyReports.push(createAccuracyReport(currentSearch, 1));
		}
	}

	processLogEntries(logEntries.events.slice(0));

	if(!accuracyReports.length) {
		return {};
	}
	else if(accuracyReports.length === 1) {
		return accuracyReports[0];
	}

	return accuracyReports;
};
