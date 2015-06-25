var _ = require('lodash');


module.exports = function(sessionLog) {
	var rateAccuracyResults = _.filter(sessionLog.events).filter(function(item) { return item.type === 'rates_accuracy_result'; });

	return {
		rateAccuracyResults: rateAccuracyResults.length
	};
};
