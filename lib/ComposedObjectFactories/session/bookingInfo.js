var _ = require('lodash');

module.exports = function(sessionLog) {
	var bookingEvents = _.filter(sessionLog.events, function(item) { 
		return item.type === 'domain_events' && item.domainEventType === "booking made"; 
	});

	var bookingIds = _.map(bookingEvents, function(item) { 
		return item.bookingId;
	});

	var enquiryEvents = _.filter(sessionLog.events, function(item) { 
		return item.type === 'reservations_monitoring' 
			&& item.message !== undefined
			&& item.message.body !== undefined
			&& item.message.body.EnquiryGuid !== undefined; 
	});

	var enquiryIds = _.map(enquiryEvents, function(item) { 
		return item.message.body.EnquiryGuid;
	});

	var arrivalDates = _.map(enquiryEvents, function(item) { 
		return item.message.body.ArrivalDate;
	});

	return {
		numberOfBookings: bookingEvents.length,
		bookingIds: bookingIds,
		enquiryIds: enquiryIds,
		arrivalDates: arrivalDates,
	};
};
