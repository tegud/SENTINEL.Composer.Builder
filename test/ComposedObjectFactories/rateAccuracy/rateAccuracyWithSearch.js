var expect = require('expect.js');
var fs = require('fs');
var proxyquire = require('proxyquire');
var Promise = require('bluebird');
var buildRequest = proxyquire('../../../lib/ComposedObjectFactories/ratesAccuracy', {
	'./hotelData': proxyquire('../../../lib/ComposedObjectFactories/ratesAccuracy/hotelData', {
		'../../config': {
			lookupStore: function() {
				return new Promise(function(resolve) {
					resolve({
						getJsonForKey: function(key) {
							return new Promise(function(resolve) {
								resolve(fakeRedisData[key]);
							});
						}
					});
				});
			}
		}
	}) 
});

var fakeRedisData = {};

describe('ratesAccuracyCheck with search', function() {
	beforeEach(function() {
		fakeRedisData = {};
	});

	it('sets hotelId', function(done) {
		var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
		var parsedData = JSON.parse(fileData);

		buildRequest({
			events: parsedData
		}).then(function(result) {
			expect(result[0].hotelId).to.eql(91567);
			done();
		});
	});

	it('sets search term', function(done) {
		var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
		var parsedData = JSON.parse(fileData);

		buildRequest({
			events: parsedData
		}).then(function(result) {
			expect(result[0].search.term).to.eql('Luton');
			done();
		});
	});

	it('sets search type to text', function(done) {
		var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
		var parsedData = JSON.parse(fileData);

		parsedData[1].url_page = '/hotels.aspx';

		buildRequest({
			events: parsedData
		}).then(function(result) {
			expect(result[0].search.type).to.eql('text');
			done();
		});
	});

	describe('keyword', function() {

		it('sets search keyword', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.keyword).to.eql('luton');
				done();
			});
		});

		it('sets search type to keyword', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.type).to.eql('keyword');
				done();
			});
		});

		it('sets search keywordId', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.keywordId).to.eql(16296071);
				done();
			});
		});

		it('sets search two word keyword', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/k16295577_loch-lomond-hotels.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.keyword).to.eql('loch lomond');
				done();
			});
		});

		it('sets search postcode keyword', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/k17392527_se10-0dx-hotels.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.keyword).to.eql('se10 0dx');
				done();
			});
		});

		it('with no page number sets pageNumber to first', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/k16295577_loch-lomond-hotels.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.pageNumber).to.eql(1);
				done();
			});
		});

		it('with page number sets pageNumber', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/k16295577_loch-lomond-hotels-p2.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.pageNumber).to.eql(2);
				done();
			});
		});

		describe('quick search keyword search', function() {
			it('sets keyword', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/ks16295577_luxury-hotels_loch-lomond.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.keyword).to.eql('loch lomond');
					done();
				});
			});

			it('sets keywordId', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/ks16295577_luxury-hotels_loch-lomond.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.keywordId).to.eql(16295577);
					done();
				});
			});

			it('sets quickSearchType', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/ks16295577_luxury-hotels_loch-lomond.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.quickSearchType).to.eql('luxury hotels');
					done();
				});
			});

			it('sets isQuickSearch', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/ks16295577_luxury-hotels_loch-lomond.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.isQuickSearch).to.eql(true);
					done();
				});
			});

			it('with no page number sets pageNumber to first', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/ks16295577_luxury-hotels_loch-lomond.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.pageNumber).to.eql(1);
					done();
				});
			});

			it('with page number sets pageNumber', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/ks16295577_luxury-hotels_loch-lomond-p2.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.pageNumber).to.eql(2);
					done();
				});
			});
		});
	});

	describe('region', function() {
		it('sets search region', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/r11550_hotels-in-glasgow.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.region).to.eql('glasgow');
				done();
			});
		});

		it('sets search type to region', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/r11550_hotels-in-glasgow.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.type).to.eql('region');
				done();
			});
		});

		it('sets search regionId', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/r11550_hotels-in-glasgow.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.regionId).to.eql(11550);
				done();
			});
		});

		it('sets search two word region', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/r11550_hotels-in-new zealand.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.region).to.eql('new zealand');
				done();
			});
		});

		it('with no page number sets pageNumber to first', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/r11550_hotels-in-new zealand.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.pageNumber).to.eql(1);
				done();
			});
		});

		it('with page number sets pageNumber', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
			var parsedData = JSON.parse(fileData);

			parsedData[1].url_page = '/r246_hotels-in-lake-district-p2.aspx';

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].search.pageNumber).to.eql(2);
				done();
			});
		});

		describe('quick search region search', function() {
			it('sets region', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/rs100_guest-houses-bed-and-breakfasts_uk.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.region).to.eql('uk');
					done();
				});
			});

			it('sets regionId', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/rs100_guest-houses-bed-and-breakfasts_uk.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.regionId).to.eql(100);
					done();
				});
			});

			it('sets quickSearchType', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/rs100_guest-houses-bed-and-breakfasts_uk.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.quickSearchType).to.eql('guest houses bed and breakfasts');
					done();
				});
			});

			it('sets isQuickSearch', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/rs100_guest-houses-bed-and-breakfasts_uk.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.isQuickSearch).to.eql(true);
					done();
				});
			});

			it('with no page number sets pageNumber to first', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/rs100_guest-houses-bed-and-breakfasts_uk.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.pageNumber).to.eql(1);
					done();
				});
			});

			it('with page number sets pageNumber', function(done) {
				var fileData = fs.readFileSync(__dirname + '/data/rateAccuracyWithLinkedSearch.json');
				var parsedData = JSON.parse(fileData);

				parsedData[1].url_page = '/rs100_guest-houses-bed-and-breakfasts_uk-p2.aspx';

				buildRequest({
					events: parsedData
				}).then(function(result) {
					expect(result[0].search.pageNumber).to.eql(2);
					done();
				});
			});
		});
	});
});
