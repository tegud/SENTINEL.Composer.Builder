var expect = require('expect.js');
var fs = require('fs');
var buildRequest = require('../../../lib/ComposedObjectFactories/ratesAccuracy');

describe('ratesAccuracyCheck', function() {
	it('sets type to "cross_application_request".', function() {
		expect(buildRequest({
			events: [
				{
					"@timestamp": "2015-06-17T13:53:35.814Z",
					"type": "lr_varnish_request",
					"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
					"@type": "lr_varnish_request",
					"url_querystring_hotelId": "195042",
					"url_querystring_rate": "503.89",
					"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
					"url_querystring_date": "1435878000",
					"url_querystring_nights": "3",
					"url_querystring_adults": "2",
					"url_querystring_children": "0"
				}
			]
		}).type).to.be('rates_accuracy_result');
	});

	describe('single search and hotel details request', function() {
		it('sets hotelId', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).hotelId).to.be(195042);
		});

		it('sets searchId', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).searchId).to.be("1ec79c06-dd05-4f3d-8b9a-a7a49b142e05");
		});

		it('sets date', function() {
			var moment = require('moment');
			console.log(moment.unix("1435878000").format("YYYY-MM-DD"));
			console.log(moment.unix("1435878000").format());

			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).date).to.be("2015-07-03");
		});

		it('sets nights', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).nights).to.be(3);
		});

		it('sets adults', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).adults).to.be(2);
		});

		it('sets children', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).children).to.be(0);
		});

		it('sets searchRate', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).searchRate).to.be(503.89);
		});

		it('sets hotelDetailsRate', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).hotelDetailsRate).to.be(501.01);
		});

		it('sets availabilityStatus', function() {
			expect(buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).availabilityStatus).to.be('OK');
		});

		describe('when search availability but no hotel details availability', function() {
			it('sets setsAvailabilityStatus', function() {
				expect(buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).availabilityStatus).to.be('ERROR');
			});

			it('sets setsAvailabilityMissing', function() {
				expect(buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).availabilityMissing).to.be('HotelDetails');
			});
		});

		describe('when no search availability but hotel details availability', function() {
			it('sets setsAvailabilityStatus', function() {
				expect(buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).availabilityStatus).to.be('ERROR');
			});

			it('sets setsAvailabilityMissing', function() {
				expect(buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).availabilityMissing).to.be('Search');
			});
		});

		describe('when no search availability and no hotel details availability', function() {
			it('sets setsAvailabilityStatus', function() {
				expect(buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).availabilityStatus).to.be('OK');
			});

			it('sets setsAvailabilityMissing', function() {
				expect(buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).availabilityMissing).to.be('SearchAndHotelDetails');
			});
		});
	});

	describe('multiple search requests then hotel details requests are handled', function() {
		it('rate comparison is of hotel details request immediately after a search', function() {
			var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
			var parsedData = JSON.parse(fileData);

			expect(buildRequest({
				events: parsedData
			})[0].hotelDetailsRate).to.eql(501.01);
		});

		describe('multiple accuracy reports are fired for multiple hotel details accuracy reports for the same hotel', function() {
			describe('second accuracy report', function() {
				it('sets hotel details rate', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[1].hotelDetailsRate).to.eql(353.66);
				});

				it('sets accuracy report number', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[1].number).to.eql(2);
				});

				it('sets hotelId', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[1].hotelId).to.eql(195042);
				});

				it('sets @timestamp', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[1]['@timestamp']).to.eql('2015-06-17T13:53:50.694Z');
				});
			});
		});

		describe('multiple accuracy reports are fired for multiple hotel details accuracy reports for the same hotel', function() {
			describe('third accuracy report', function() {
				it('sets hotelId', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[2].hotelId).to.eql(145945);
				});

				it('sets accuracy report number', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[2].number).to.eql(1);
				});

				it('sets search rate', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[2].searchRate).to.eql(559.75);
				});

				it('sets hotel details rate', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[2].hotelDetailsRate).to.eql(556.54);
				});

				it('sets rate difference', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[2].rateDifference).to.eql(3.21);
				});

				it('sets rate difference percentage', function() {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					expect(buildRequest({
						events: parsedData
					})[2].rateDifferencePercentage).to.eql(100.58);
				});
			});
			
		});
	});
});
