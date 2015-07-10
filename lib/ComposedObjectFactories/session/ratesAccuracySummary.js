var _ = require('lodash');


module.exports = function(sessionLog) {
	var searchRequests = _.filter(sessionLog.events, function(item) { return item.type === 'lr_varnish_request' && item.url_page_type === 'search'; });
	var hotelDetailsRequests = _.filter(sessionLog.events, function(item) { return item.type === 'lr_varnish_request' && item.url_page_type === 'hotel-details'; });
	var rateAccuracyResults = _.filter(sessionLog.events, function(item) { return item.type === 'rates_accuracy_result'; });
	var outcomes = _.pluck(rateAccuracyResults, 'result');

	return {
		rateAccuracyResults: rateAccuracyResults.length,
		outcomes: outcomes.join(' '),
		lastOutcome: _.last(outcomes),
		failures: _.filter(outcomes, function(outcome) {
			return outcome !== 'OK';
		}).length,
		containsSearch: searchRequests.length ? true : false,
		containsHotelDetails: hotelDetailsRequests.length ? true : false
	};
};
