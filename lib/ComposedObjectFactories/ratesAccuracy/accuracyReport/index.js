var moment = require('moment');
var _ = require('lodash');

var logging = require('../../../logging');

var buildSearchContext = require('./searchContext');
var buildHotelDetailsContext = require('./hotelDetailsContext');

function getRate(fromObject) {
	if(fromObject && fromObject['url_querystring_rate']) {
		 return parseFloat(fromObject['url_querystring_rate']);
	}

	return 'Unknown';
}

function getDateFromUnixTimeOrString(dateString) {
	if(/^[0-9]+$/.exec(dateString)) {
		return moment.unix(dateString).format("YYYY-MM-DD");
	}

	return dateString;
}

function getRatesAndComparison(search, hotelDetails) {
	var baseObject = {};

	var searchRate = getRate(search);
	var hotelDetailsRate = getRate(hotelDetails);

	if(searchRate !== 'Unknown') {
		baseObject.searchRate = searchRate;
		baseObject.searchCurrency = search.url_querystring_currency;
	}
	else {
		baseObject.searchRate = 0;
	}

	if(hotelDetailsRate !== 'Unknown') {
		baseObject.hotelDetailsRate = hotelDetailsRate;
		baseObject.hotelDetailsCurrency = hotelDetails.url_querystring_currency;
	}
	else {
		baseObject.hotelDetailsRate = 0;
	}

	if(searchRate !== 'Unknown' && hotelDetailsRate !== 'Unknown') {
		if(hotelDetailsRate > searchRate) {
			baseObject.result = 'MORE_EXPENSIVE';
		}
		else if (hotelDetailsRate < searchRate) {
			baseObject.result = 'LESS_EXPENSIVE';
		}
		else {
			baseObject.result = 'OK';
		}

		baseObject.difference = parseFloat((searchRate - hotelDetailsRate).toFixed(2));
		baseObject.absoluteDifference = Math.abs(baseObject.difference);
		baseObject.percentageDifference = Math.abs(parseFloat((100 - ((searchRate / hotelDetailsRate) * 100)).toFixed(2)));
		baseObject.availabilityStatus = 'OK';
	}
	else if (searchRate === 'Unknown' && hotelDetailsRate !== 'Unknown'){
		baseObject.availabilityStatus = 'ERROR';
		baseObject.availabilityMissing = 'Search';

	}
	else if (searchRate !== 'Unknown' && hotelDetailsRate === 'Unknown'){
		baseObject.result = 'NO_AVAILABILITY';
		baseObject.availabilityStatus = 'ERROR';
		baseObject.availabilityMissing = 'HotelDetails';
	}
	else {
		baseObject.result = 'OK';
		baseObject.availabilityStatus = 'OK';
		baseObject.availabilityMissing = 'SearchAndHotelDetails';
	}

	if(hotelDetails && search['url_querystring_currency'] === hotelDetails['url_querystring_currency']) {
		baseObject.currencyMatch = true;
	}
	else if (hotelDetails && search['url_querystring_currency'] !== hotelDetails['url_querystring_currency']) {
		if(baseObject.result !== 'NO_AVAILABILITY') {
			baseObject.result = 'CURRENCY_MISS';
		}
		baseObject.currencyMatch = false;
	}
	else {
		baseObject.currencyMatch = false;
	}

	return baseObject;
}

module.exports = function createAccuracyReport(hotelData, search, serverSearchContext, hotelDetails, accuracyReportNumber) {
	var hotelId = parseInt(search['url_querystring_hotelId'], 10);
	var nights = parseInt(search['url_querystring_nights'], 10);
	var adults = parseInt(search['url_querystring_adults'], 10);
	var children = parseInt(search['url_querystring_children'], 10);
	var sessionId = search.url_querystring_session;

	if(!hotelDetails) {
		logging.logError('RatesAccuracyCheck was missing a hotel details entry', {
			sessionId: sessionId
		});
	}

	return _.merge({
		type: 'rates_accuracy_result',
		'@timestamp': hotelDetails ? hotelDetails['@timestamp'] : search['@timestamp'],
		date: getDateFromUnixTimeOrString(search.url_querystring_date),
		hotelId: hotelId,
		searchId: search.url_querystring_searchId,
		sessionId: sessionId,
		nights: nights,
		adults: adults,
		children: children,
		number: accuracyReportNumber,
		hotelDetailsPresent: hotelDetails ? true : false,
		hotelDetails: buildHotelDetailsContext(hotelData, hotelId),
		search: buildSearchContext(serverSearchContext),
	}, getRatesAndComparison(search, hotelDetails));
};
