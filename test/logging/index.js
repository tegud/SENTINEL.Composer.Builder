var expect = require('expect.js');
var proxyquire = require('proxyquire');
var dgram = require('dgram');
var Promise = require('bluebird');
var fs = require('fs');
var logging = proxyquire('../../lib/logging', {
	'./console': FakeLogger
}); 
var _ = require('lodash');
var moment = require('moment');

var loggedItems = [];

function FakeLogger() {
	return function (level, module, message) {
		loggedItems.push({
			level: level,
			module: module, 
			message: message
		});
	}
}

describe('Logging', function() {
	beforeEach(function() {
		loggedItems = [];
		logging.removeAll();
	});

	describe('externally defined logging module', function() {
		it('matching log level is logged', function() {
			logging.registerLogger({ level: 'INFO' }, FakeLogger);

			logging.log('INFO', undefined, 'TEST MESSAGE');

			expect(loggedItems[0].message).to.be('TEST MESSAGE');
		});

		it('lower log level is not logged', function() {
			logging.registerLogger({ level: 'INFO' }, FakeLogger);

			logging.log('DEBUG', undefined, 'TEST MESSAGE');

			expect(loggedItems.length).to.be(0);
		});

		it('higher log level is logged', function() {
			logging.registerLogger({ level: 'INFO' }, FakeLogger);

			logging.log('ERROR', undefined, 'TEST MESSAGE');

			expect(loggedItems[0].message).to.be('TEST MESSAGE');
		});

		it('logs info', function() {
			logging.registerLogger({ level: 'INFO', type: 'console' });

			logging.logInfo('TEST MESSAGE');

			expect(loggedItems[0].level).to.be('INFO');
		});

		it('logs debug', function() {
			logging.registerLogger({ level: 'DEBUG', type: 'console' });

			logging.logDebug('TEST MESSAGE');

			expect(loggedItems[0].level).to.be('DEBUG');
		});

		it('logs error', function() {
			logging.registerLogger({ level: 'ERROR', type: 'console' });

			logging.logError('TEST MESSAGE');

			expect(loggedItems[0].level).to.be('ERROR');
		});
	});

	describe('built in logging module', function() {
		it('matching log level is logged', function() {
			logging.registerLogger({ level: 'INFO', type: 'console' });

			logging.log('INFO', undefined, 'TEST MESSAGE');

			expect(loggedItems[0].message).to.be('TEST MESSAGE');
		});
	});

	describe('forModule', function() {
		it('sets module name', function() {
			logging.registerLogger({ level: 'INFO', type: 'console' });

			logging.forModule('TEST MODULE').logInfo('TEST MESSAGE');

			expect(loggedItems[0].module).to.be('TEST MODULE');
		});

		it('logs info', function() {
			logging.registerLogger({ level: 'INFO', type: 'console' });

			logging.forModule('TEST MODULE').logInfo('TEST MESSAGE');

			expect(loggedItems[0].level).to.be('INFO');
		});

		it('logs debug', function() {
			logging.registerLogger({ level: 'DEBUG', type: 'console' });

			logging.forModule('TEST MODULE').logDebug('TEST MESSAGE');

			expect(loggedItems[0].level).to.be('DEBUG');
		});

		it('logs error', function() {
			logging.registerLogger({ level: 'ERROR', type: 'console' });

			logging.forModule('TEST MODULE').logError('TEST MESSAGE');

			expect(loggedItems[0].level).to.be('ERROR');
		});
	});

	describe('setLoggerLevel', function() {
		it('modifies the specified logger\'s level', function() {
			logging.registerLogger({ level: 'INFO', type: 'console', name: 'default' });
			logging.setLoggerLevel('default', 'DEBUG');

			logging.log('DEBUG', undefined, 'TEST MESSAGE');

			expect(loggedItems[0].message).to.be('TEST MESSAGE');
		});
	});
});
