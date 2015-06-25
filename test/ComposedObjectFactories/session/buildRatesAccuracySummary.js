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

	it('sets the outcomes to space delimited list of rules', function() {
		expect(buildSummary({ 
			events: [
				{ type: 'rates_accuracy_result', result: 'OK' },
				{ type: 'rates_accuracy_result', result: 'OK' },
				{ type: 'rates_accuracy_result', result: 'NO_AVAILABILITY' }
			]
		}).outcomes).to.be('OK OK NO_AVAILABILITY');
	});

	it('sets the outcomes to space delimited list of rules', function() {
		expect(buildSummary({ 
			events: [
				{ type: 'rates_accuracy_result', result: 'OK' },
				{ type: 'rates_accuracy_result', result: 'OK' },
				{ type: 'rates_accuracy_result', result: 'NO_AVAILABILITY' }
			]
		}).outcomes).to.be('OK OK NO_AVAILABILITY');
	});

	it('sets the failures', function() {
		expect(buildSummary({ 
			events: [
				{ type: 'rates_accuracy_result', result: 'OK' },
				{ type: 'rates_accuracy_result', result: 'OK' },
				{ type: 'rates_accuracy_result', result: 'NO_AVAILABILITY' }
			]
		}).failures).to.be(1);
	});	
});
