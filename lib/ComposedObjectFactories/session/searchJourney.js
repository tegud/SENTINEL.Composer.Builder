var _ = require('lodash');

module.exports = function(sessionLog) {

	var searchEvents = _.chain(sessionLog.events).filter(function(item) { 
		return item.type === 'searchengine'; 
	});

	if (!searchEvents.first().value()) {
		return;
	}

	return {
		numberOfSearches: searchEvents.value().length,
		variantName: searchEvents.last().value().VariantName,
		numberOfHotelsToPromote: searchEvents.sum(function(item) { return item.NumberOfHotelsToPromote; }).value(),
		numberOfHotelsPromoted: searchEvents.sum(function(item) { return item.NumberOfHotelsPromoted; }).value()
	};
};
