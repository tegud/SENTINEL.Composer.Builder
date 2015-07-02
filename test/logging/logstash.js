var expect = require('expect.js');
var proxyquire = require('proxyquire');
var dgram = require('dgram');
var net = require('net');
var logstashLogger = require('../../lib/logging/logstash'); 
var _ = require('lodash');
var moment = require('moment');

describe('Logstash Logger', function() {
	describe('logs to udp', function() {
		it('formatted event is sent', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'udp',
					host: '127.0.0.1',
					port: 9990
				},
				format: 'logstash',
				type: 'test_type'
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

	describe('logs to tcp', function() {
		it('formatted event is sent', function(done) {
			var logger = new logstashLogger({
				output: {
					transport: 'tcp',
					host: '127.0.0.1',
					port: 9991
				},
				format: 'logstash',
				type: 'test_type'
			});

			var server = net.createServer(function(socket) {
				socket.on('data', function (msg) {
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

			server.listen(9991, '127.0.0.1', function() {
				console.log('listenning...');
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
				format: 'logstash',
				type: { 
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
				format: 'logstash',
				type: { 
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
				format: 'logstash',
				type: { 
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
});
