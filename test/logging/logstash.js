var expect = require('expect.js');
var proxyquire = require('proxyquire');
var dgram = require('dgram');
var net = require('net');
var logstashLogger = proxyquire('../../lib/logging/logstash', {
	'moment': function() {
		return {
			format: function() {
				return formattedDateTime;
			}
		};
	}
}); 
var _ = require('lodash');
var moment = require('moment');
var formattedDateTime;

describe('Logstash Logger', function() {
	describe('logs to udp', function() {
		it('formatted event is sent', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				eventType: 'test_type'
			});

			var udpClient = dgram.createSocket("udp4");

			udpClient.bind(9990);

			udpClient.on("message", function messageReceived(msg) {
				var data = msg.toString('utf-8');
				var parsedData = JSON.parse(data);

				expect(parsedData).to.eql({
					type: 'test_type',
					message: 'TEST MESSAGE'
				});

				udpClient.close();

				done();
			});

			logger('INFO', undefined, 'TEST MESSAGE');
		});
	});

	describe.skip('logs to tcp', function() {
		it('formatted event is sent', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'tcp',
					host: '127.0.0.1',
					port: 9991
				},
				eventType: 'test_type'
			});

			var server = net.createServer(function(socket) {
				console.log('Client connected...')

				socket.on('data', function (msg) {
					console.log('DATA REC');
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData).to.eql({
						type: 'test_type',
						message: 'TEST MESSAGE'
					});

					server.close();

					done();
				});
			});

			server.on('error', function (e) {
				console.log('ERROR!!! ' + e.code);
			});

			server.listen(9991, '0.0.0.0', function() {
				console.log('listening...');
			});

			setTimeout(function() {
				console.log('Sending...');
				logger('INFO', undefined, 'TEST MESSAGE');
			}, 1000)
		});
	});

	describe('type can be fined by level', function() {
		var udpClient;

		beforeEach(function() {
			udpClient = dgram.createSocket("udp4");

			udpClient.bind(9990);
		});

		afterEach(function() {
			udpClient.close();
		});

		it('type prefix is prepended to lower case level', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				eventType: { 
					prefix: 'test_type_' 
				}
			});

			udpClient.on("message", function messageReceived(msg) {
				var data = msg.toString('utf-8');
				var parsedData = JSON.parse(data);

				expect(parsedData).to.eql({
					type: 'test_type_info',
					message: 'TEST MESSAGE'
				});


				done();
			});

			logger('INFO', undefined, 'TEST MESSAGE');
		});

		it('sets level', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				eventType: { 
					prefix: 'test_type_' 
				}
			});

			udpClient.on("message", function messageReceived(msg) {
				var data = msg.toString('utf-8');
				var parsedData = JSON.parse(data);

				expect(parsedData).to.eql({
					type: 'test_type_error',
					message: 'TEST MESSAGE'
				});

				done();
			});

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets level specific override', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				eventType: { 
					prefix: 'test_type_',
					overrides: {
						'error': 'errors'
					}
				}
			});

			udpClient.on("message", function messageReceived(msg) {
				var data = msg.toString('utf-8');
				var parsedData = JSON.parse(data);

				expect(parsedData).to.eql({
					type: 'test_type_errors',
					message: 'TEST MESSAGE'
				});

				done();
			});

			logger('ERROR', undefined, 'TEST MESSAGE');
		});
	});

	describe('json codec', function() {
		var udpClient;
		var logger;

		beforeEach(function() {
			udpClient = dgram.createSocket("udp4");

			udpClient.bind(9990);

			logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				eventType: 'test_type'
			});

			formattedDateTime = '';
		});

		afterEach(function() {
			udpClient.close();
		});

		function handleMessage(done, expectation, msg) {
			var data = msg.toString('utf-8');
			var parsedData = JSON.parse(data);

			expectation(parsedData);

			done();
		}

		it('sets type', function(done) {
			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData.type).to.be('test_type');
			}));

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets @timestamp', function(done) {
			formattedDateTime = '2015-07-02T19:06:56.078Z';

			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData['@timestamp']).to.eql('2015-07-02T19:06:56.078Z');
			}));

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets message', function(done) {
			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData.message).to.eql('TEST MESSAGE');
			}));

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets additionalProperties', function(done) {
			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData.a).to.eql(1);
			}));

			logger('ERROR', undefined, 'TEST MESSAGE', { a: 1 });
		});

		describe('sets additionalProperties with keywords', function() {
			it('does not overwrite message', function(done) {
				udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
					expect(parsedData.message).to.eql('TEST MESSAGE');
				}));

				logger('ERROR', undefined, 'TEST MESSAGE', { message: '1' });
			});

			it('sets message as additionalMessage', function(done) {
				udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
					expect(parsedData.additionalMessage).to.eql(1);
				}));

				logger('ERROR', undefined, 'TEST MESSAGE', { message: 1 });
			});

			it('does not overwrite @timestamp', function(done) {
				formattedDateTime = '2015-07-02T19:06:56.078Z';

				udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
					expect(parsedData['@timestamp']).to.eql('2015-07-02T19:06:56.078Z');
				}));

				logger('ERROR', undefined, 'TEST MESSAGE', { '@timestamp': '1' });
			});

			it('sets message as additionalTimestamp', function(done) {
				udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
					expect(parsedData.additionalTimestamp).to.eql(1);
				}));

				logger('ERROR', undefined, 'TEST MESSAGE', { '@timestamp': 1 });
			});
		});
	});

	describe('old logstash json codec', function() {
		var udpClient;
		var logger;

		beforeEach(function() {
			udpClient = dgram.createSocket("udp4");

			udpClient.bind(9990);

			logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				codec: 'oldlogstashjson',
				eventType: 'test_type'
			});

			formattedDateTime = '';
		});

		afterEach(function() {
			udpClient.close();
		});

		function handleMessage(done, expectation, msg) {
			var data = msg.toString('utf-8');
			var parsedData = JSON.parse(data);

			expectation(parsedData);

			done();
		}

		it('sets type', function(done) {
			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData['@type']).to.be('test_type');
			}));

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets @timestamp', function(done) {
			formattedDateTime = '2015-07-02T19:06:56.078Z';

			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData['@timestamp']).to.eql('2015-07-02T19:06:56.078Z');
			}));

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets message', function(done) {
			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData['@message']).to.eql('TEST MESSAGE');
			}));

			logger('ERROR', undefined, 'TEST MESSAGE');
		});

		it('sets additionalProperties', function(done) {
			udpClient.on("message", handleMessage.bind(undefined, done, function(parsedData) {	
				expect(parsedData['@fields'].a).to.eql(1);
			}));

			logger('ERROR', undefined, 'TEST MESSAGE', { a: 1 });
		});
	});
});
