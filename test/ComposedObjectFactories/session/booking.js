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

	it('sets bookingIds to the list of bookingIds', function() {
		expect(buildBooking({
			events: [
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037395 },
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037859 }
			]
		}).bookingIds).to.eql([33037395, 33037859]);
	});

	it('sets enquiryIds to the list of enquiry Ids', function() {
		expect(buildBooking({
			events: [
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037395 },
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037859 },
				{ "type": "reservations_monitoring", "message": { "body": { "EnquiryGuid": "79750000-5683-0050-4d35-08d41d098dfd" }} },
				{ "type": "reservations_monitoring", "message": { "body": { "EnquiryGuid": "71e95f03-6f9e-4ca2-83fb-7b7f1a04c341" }} },
			]
		}).enquiryIds).to.eql(["79750000-5683-0050-4d35-08d41d098dfd", "71e95f03-6f9e-4ca2-83fb-7b7f1a04c341"]);
	});

	it('sets arrivalDate to the list of enquiry arrival dates', function() {
		expect(buildBooking({
			events: [
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037395 },
				{ "type": "domain_events", "domainEventType": "booking made", "bookingId": 33037859 },
				{ "type": "reservations_monitoring", "message": { "body": { "EnquiryGuid": "79750000-5683-0050-4d35-08d41d098dfd", "ArrivalDate": "2016-12-08"}} },
				{ "type": "reservations_monitoring", "message": { "body": { "EnquiryGuid": "71e95f03-6f9e-4ca2-83fb-7b7f1a04c341", "ArrivalDate": "2016-12-10"}} },
			]
		}).arrivalDates).to.eql(["2016-12-08", "2016-12-10"]);
	});
});