var expect = require('expect.js');
var buildRequests = require('../../../lib/ComposedObjectFactories/session');
var fs = require('fs');

describe('build search journey', function() {
	it('sets number of searches', function() {
		expect(buildRequests({
			events: JSON.parse(fs.readFileSync(__dirname + '/../../data/search-requestlog.json', 'utf-8'))
		}).searchJourney.numberOfSearches).to.be(2);
	});
	it('sets variant name', function() {
		expect(buildRequests({
			events: JSON.parse(fs.readFileSync(__dirname + '/../../data/search-requestlog.json', 'utf-8'))
		}).searchJourney.variantName).to.be("f0154fe0-9eb3-4368-9868-1e40e8330f9a");
	});
	it('sets hotels to promote', function() {
		expect(buildRequests({
			events: JSON.parse(fs.readFileSync(__dirname + '/../../data/search-requestlog.json', 'utf-8'))
		}).searchJourney.numberOfHotelsToPromote).to.be(3);
	});
	it('sets promoted hotels', function() {
		expect(buildRequests({
			events: JSON.parse(fs.readFileSync(__dirname + '/../../data/search-requestlog.json', 'utf-8'))
		}).searchJourney.numberOfHotelsPromoted).to.be(2);
	});
});
