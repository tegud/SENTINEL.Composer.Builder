var expect = require('expect.js');
var proxyquire = require('proxyquire');
var consoleLogger = proxyquire('../../lib/logging/console', {
	'./writeToConsole': fakeWriteToConsole,
	'moment': function() {
		return {
			format: function() { return formatedDateString; }
		};
	}
}); 
var _ = require('lodash');

var loggedMessage;
var formatedDateString;

function fakeWriteToConsole(message) {
	loggedMessage = message;
}

describe('Console Logger', function() {
	beforeEach(function() {
		loggedMessage = '';
		formatedDateString = '';
	});

	it('logs current time', function() {
		formatedDateString = '2015-07-02T11:28:30+01:00';

		new consoleLogger()('INFO', undefined, 'TEST MESSAGE');

		expect(loggedMessage.substring(0, 27)).to.be('[2015-07-02T11:28:30+01:00]');
	});

	it('logs level', function() {
		new consoleLogger()('INFO', undefined, 'TEST MESSAGE');

		expect(loggedMessage.substring(0, 9)).to.be('[] [INFO]');
	});

	it('logs message', function() {
		new consoleLogger()('INFO', undefined, 'TEST MESSAGE');

		expect(loggedMessage).to.be('[] [INFO] TEST MESSAGE');
	});

	it('logs module if present', function() {
		new consoleLogger()('INFO', 'TEST MODULE', 'TEST MESSAGE');

		expect(loggedMessage).to.be('[] [INFO] [TEST MODULE] TEST MESSAGE');
	});

	it('logs data if present', function() {
		new consoleLogger()('INFO', 'TEST MODULE', 'TEST MESSAGE', { a: 1, b: 2 });

		expect(loggedMessage).to.be('[] [INFO] [TEST MODULE] TEST MESSAGE, a: 1, b: 2');
	});
});
