var _ = require('lodash');

module.exports = function(sessionLog) {
	var bookingEvents = _.filter(sessionLog.events, function(item) { 
		return item.type === 'domain_events' && item.domainEventType === "booking made"; 
	});

	var bookingIds = _.map(bookingEvents, function(item) { 
		return item.bookingId;
	});

	return {
		numberOfBookings: bookingEvents.length,
		bookingIds: bookingIds,
	};
};
