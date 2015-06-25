var _ = require('lodash');


module.exports = function(sessionLog) {
	var rateAccuracyResults = _.filter(sessionLog.events).filter(function(item) { return item.type === 'rates_accuracy_result'; });
	var outcomes = _.pluck(rateAccuracyResults, 'result');

	return {
		rateAccuracyResults: rateAccuracyResults.length,
		outcomes: outcomes.join(' '),
		failures: _.filter(outcomes, function(outcome) {
			return outcome !== 'OK';
		}).length
	};
};
