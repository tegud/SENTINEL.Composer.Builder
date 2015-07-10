var expect = require('expect.js');
var buildRequests = require('../../../lib/ComposedObjectFactories/session');
var fs = require('fs');

describe('session - real data one', function() {
	it('sets funnel entry to search', function() {
		expect(buildRequests({
			events: JSON.parse(fs.readFileSync(__dirname + '/../../data/search-entry.json', 'utf-8'))
		}).requests.funnelEnteredAt).to.be('search');
	});

	it('sets funnel exit to booking', function() {
		expect(buildRequests({
			events: JSON.parse(fs.readFileSync(__dirname + '/../../data/search-entry.json', 'utf-8'))
		}).requests.funnelExitedAt).to.be('booking');
	});
});
