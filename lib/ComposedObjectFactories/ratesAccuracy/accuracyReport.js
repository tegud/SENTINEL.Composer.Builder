var moment = require('moment');

module.exports = function createAccuracyReport(hotelData, search, hotelDetails, accuracyReportNumber) {
	var hotelId = parseInt(search['url_querystring_hotelId'], 10);
	var nights = parseInt(search['url_querystring_nights'], 10);
	var adults = parseInt(search['url_querystring_adults'], 10);
	var children = parseInt(search['url_querystring_children'], 10);

	var baseObject = {
		type: 'rates_accuracy_result',
		'@timestamp': hotelDetails ? hotelDetails['@timestamp'] : search['@timestamp'],
		hotelId: hotelId,
		searchId: search.url_querystring_searchId,
		sessionId: search.url_querystring_session,
		nights: nights,
		adults: adults,
		children: children,
		number: accuracyReportNumber,
		hotelDetailsPresent: hotelDetails ? true : false
	};

	if(/^[0-9]+$/.exec(search.url_querystring_date)) {
		baseObject.date = moment.unix(search.url_querystring_date).format("YYYY-MM-DD");
	}
	else {
		baseObject.date = search.url_querystring_date;
	}

	if(hotelData[hotelId]) {
		baseObject.hotelDetails = hotelData[hotelId];

		if(baseObject.hotelDetails.providerName === 'Commission') {
			baseObject.hotelDetails.providerName = 'LateRooms'
		}
	}

	var searchRate;
	var hotelDetailsRate;

	if(search['url_querystring_rate']) {
		searchRate = parseFloat(search['url_querystring_rate']);
	}
	else {
		searchRate = 'Unknown';
	}

	if(searchRate !== 'Unknown') {
		baseObject.searchRate = searchRate;
		baseObject.searchCurrency = search.url_querystring_currency;
	}
	else {
		baseObject.searchRate = 0;
	}

	if(hotelDetails && hotelDetails['url_querystring_rate']) {
		hotelDetailsRate = parseFloat(hotelDetails['url_querystring_rate']);
	}
	else {
		hotelDetailsRate = 'Unknown';
	}

	if(hotelDetailsRate !== 'Unknown') {
		baseObject.hotelDetailsRate = hotelDetailsRate;
		baseObject.hotelDetailsCurrency = hotelDetails.url_querystring_currency;
	}
	else {
		baseObject.hotelDetailsRate = 0;
	}

	if(searchRate !== 'Unknown' && hotelDetailsRate !== 'Unknown') {
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
		baseObject.availabilityStatus = 'ERROR';
		baseObject.availabilityMissing = 'HotelDetails';
	}
	else {
		baseObject.availabilityStatus = 'OK';
		baseObject.availabilityMissing = 'SearchAndHotelDetails';
	}

	if(hotelDetails && search['url_querystring_currency'] === hotelDetails['url_querystring_currency']) {
		baseObject.currencyMatch = true;
	}
	else {
		baseObject.currencyMatch = false;
	}

	return baseObject;
};
