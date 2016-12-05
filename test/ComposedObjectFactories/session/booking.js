var expect = require('expect.js');
var buildBooking = require('../../../lib/ComposedObjectFactories/session/bookingInfo');

describe('buildBooking', function() {
	it('sets numberOfBookings to the number of booking made domain events', function() {
		expect(buildBooking({
			events: [
				{ "type": "domain_events", "domainEventType": "booking made" },
				{ "type": "domain_events", "domainEventType": "booking made" }
			]
		}).numberOfBookings).to.be(2);
	});	
	it('sets bookingIds to the list of bookindIds', function() {
		expect(buildBooking({
			events: [
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037395 },
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037859 }
			]
		}).bookingIds).to.eql([33037395, 33037859]);
	});	
});