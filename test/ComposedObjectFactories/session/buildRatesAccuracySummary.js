var expect = require('expect.js');
var buildSummary = require('../../../lib/ComposedObjectFactories/session/ratesAccuracySummary');

describe('buildRatesAccuracySummary', function() {
	it('sets number of ratesAccuracyResults', function() {
		expect(buildSummary({ 
			events: [
				{ type: 'rates_accuracy_result' },
				{ type: 'rates_accuracy_result' }
			]
		}).rateAccuracyResults).to.be(2);
	});
});
