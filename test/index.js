var expect = require('expect.js');
var proxyquire = require('proxyquire');
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var fs = require('fs');
var fakeRedis = require('./fake-redis');
var amqpSub = require('./amqp-sub');
var Server = proxyquire('../lib/server', {
	'./config': proxyquire('../lib/config', {
		'../stores/redis': proxyquire('../lib/stores/redis', {
			'redis': fakeRedis
		})
	})
}); 
var _ = require('lodash');
var moment = require('moment');

describe('Composer.Builder', function() {
	var udpClient;
	var server;
	var port = 1234;

	function sendTest(testData, gapBetween) {
		var currentTestItem = JSON.stringify(testData.shift());
		var message = new Buffer(currentTestItem);

		udpClient.send(message, 0, message.length, port, "localhost", function() {
			if(testData.length) {
				setTimeout(function() {
					sendTest(testData, gapBetween);
				}, gapBetween);
			}
		});
	}

	function loadTestData(fileName) {
		var testData = fs.readFileSync(__dirname + '/data/' + fileName, 'utf-8');

		return JSON.parse(testData);
	}

	function cloneData(data) {
		return JSON.parse(JSON.stringify(data));
	}

	function generateRedisListKey(type, key) {
		return type + '_list_' + key;
	}

	function populateRedisData(type, key, file) {
		var testData = loadTestData(file);

		fakeRedis.setKeyData(generateRedisListKey(type, key), _.map(testData, function(row) { return JSON.stringify(row); }));
	}

	function generateKeyObject(type, key) {
		return {
			expiredEventTimeStamp: moment().format(),
			aggregatorType: type,
			expiredKey: key,
			factory: type,
			store: {
				name: 'redis',
				eventListKey: generateRedisListKey(type, key)
			}
		};
	}

	function populateRedisAndSetExpiredKeyMessage(type, key, dataFile) {
		var expiredKeyMessage = new Buffer(JSON.stringify(generateKeyObject(type, key)));

		populateRedisData(type, key, dataFile);

		udpClient.send(expiredKeyMessage, 0, expiredKeyMessage.length, port, "localhost");
	}


	describe('event is inputted via udp', function() {
		afterEach(function(done) {
			udpClient.close();
			eventEmitter.removeAllListeners();

			server.stop().then(done.bind(undefined, undefined));

			server = null;

			fakeRedis.clearData();
		});

		beforeEach(function(done) {
			server = new Server();

			server.loadConfig({
				stores: {
					'redis': {
						type: 'redis',
						host: '192.168.50.7',
						port: 6379
					}
				},
				listeners: [
					{ type: 'udp', port: 1234 }
				],
				publishers: [
					{ type: 'udp', host: '127.0.0.1', port: 1235 }
				]
			}).then(server.start).then(done);

			udpClient = dgram.createSocket("udp4");

			udpClient.bind(1235);

			eventEmitter = new EventEmitter();
		});

		describe('creates new session object', function() {
			it('sets key', function(done) {
				populateRedisAndSetExpiredKeyMessage('session', '104e9439-63de-4373-95ff-6dfa365e4951', 'three.json');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(parsedData.type !== 'session') {
						return;
					}

					expect(parsedData.sessionId).to.be('104e9439-63de-4373-95ff-6dfa365e4951');
					done();
				});
			});	

			describe('sets requests', function() {
				it('total', function(done) {
					populateRedisAndSetExpiredKeyMessage('session', '104e9439-63de-4373-95ff-6dfa365e4951', 'three.json');

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						if(parsedData.type !== 'session') {
							return;
						}

						expect(parsedData.requests.total).to.be(3);
						done();
					});
				});	

				it('funnelExitedAt to last funnel page type seen', function(done) {
					populateRedisAndSetExpiredKeyMessage('session', '104e9439-63de-4373-95ff-6dfa365e4951', 'three.json');

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						if(parsedData.type !== 'session') {
							return;
						}

						expect(parsedData.requests.funnelExitedAt).to.be('hotel-details');
						done();
					});
				});
			});

			describe('sets errors', function() {
				it('total to number of errors encountered in session', function(done) {
					populateRedisAndSetExpiredKeyMessage('session', '86b0a5c9-a592-413f-a549-b156056b1f96', 'errors.json');

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						if(parsedData.type !== 'session') {
							return;
						}

						expect(parsedData.errors.total).to.be(2);
						done();
					});
				});
				
			});

			it('sets booked to false if session does not contain conversion event', function(done) {
				populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'one.json');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(parsedData.type !== 'session') {
						return;
					}

					expect(parsedData.booked).to.be(false);
					done();
				});
			});

			it('sets booked to true if session contains conversion event', function(done) {
				populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'booking.json');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(parsedData.type !== 'session') {
						return;
					}

					expect(parsedData.booked).to.be(true);
					done();
				});
			});

			it('sets tokeniser to ipg if session contains no paymentprocessor events', function(done) {
				populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'booking.json');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(parsedData.type !== 'session') {
						return;
					}

					expect(parsedData.tokeniserJourney.tokeniser).to.be('ipg');
					done();
				});
			});

			it('sets tokeniser to paymentprocessor if session contains paymentprocessor events', function(done) {
				populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'booking_with_paymentprocessor.json');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(parsedData.type !== 'session') {
						return;
					}

					expect(parsedData.tokeniserJourney.tokeniser).to.be('paymentprocessor');
					done();
				});
			});

			it('sets bookingDetails if session contains conversion event', function(done) {
				populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'booking.json');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(parsedData.type !== 'session') {
						return;
					}

					expect(parsedData.bookingDetails).to.eql({
						isTestBooking: false,
						rooms: 1,
						nights: 2,
						roomNights: 2,
						hotel: {
							id: 123432,
							provider: 'LateRooms',

						},
						affiliate: {
							id: 1234,
							name: 'AsiaRooms'
						},
						totalAmountGbp: 110,
						commission: {
							percent: 18,
							value: 19.8
						},
						channel: {
							id: 9
						}
					});
					done();
				});
			});

			describe('sets user', function() {
				it('ip address info to value of last request', function(done) {
					populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'one.json');

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						if(parsedData.type !== 'session') {
							return;
						}

						expect(parsedData.user.ip).to.eql({
							"address": '66.249.69.105',
							"organisation": {
								"number": "AS15169",
								"asn": "Google Inc."
							},
							"geoip": {
								"country_code2": "US",
								"country_code3": "USA",
								"country_name": "United States",
								"continent_code": "NA",
								"region_name": "CA",
								"city_name": "Mountain View",
								"latitude": 37.385999999999996,
								"longitude": -122.0838,
								"dma_code": 807,
								"area_code": 650,
								"timezone": "America/Los_Angeles",
								"real_region_name": "California",
								"location": [
									-122.0838,
									37.385999999999996
								]
							}
						});
						done();
					});
				});

				it('userAgent to value of last request', function(done) {
					populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'one.json');
					
					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						if(parsedData.type !== 'session') {
							return;
						}

						expect(parsedData.user.userAgent).to.eql({
							full: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
							name: "Googlebot",
							os: "Other",
							osName: "Other",
							device: "Spider",
							major: "2",
							minor: "1"
						});
						done();
					});
				});

				describe('type', function() {
					it('to GoodBot when last request was identified as a bot from UserAgent', function(done) {
						populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'one.json');

						udpClient.on("message", function messageReceived(msg) {
							var data = msg.toString('utf-8');
							var parsedData = JSON.parse(data);

							if(parsedData.type !== 'session') {
								return;
							}

							expect(parsedData.user.type).to.be('GoodBot');
							done();
						});
					});

					it('to BadBot when last request was not identified as a bot from UserAgent and BotBuster score over 0', function(done) {
						populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'badbot.json');

						udpClient.on("message", function messageReceived(msg) {
							var data = msg.toString('utf-8');
							var parsedData = JSON.parse(data);

							if(parsedData.type !== 'session') {
								return;
							}

							expect(parsedData.user.type).to.be('BadBot');
							done();
						});
					});

					it('to Human when last request was not identified as a bot from UserAgent and BotBuster score of 0', function(done) {
						populateRedisAndSetExpiredKeyMessage('session', '9454ed95-7a18-4bc2-99bb-548aaa50d6a1', 'notabot.json');

						udpClient.on("message", function messageReceived(msg) {
							var data = msg.toString('utf-8');
							var parsedData = JSON.parse(data);

							if(parsedData.type !== 'session') {
								return;
							}

							expect(parsedData.user.type).to.be('Human');
							done();
						});
					});
				});
			});
		});

		describe('created new Cross Application Request object', function() {
			function populateRedis(type, key, keyProperty, data) {
				fakeRedis.setKeyData(generateRedisListKey(type, key), _.chain(data).filter(function(row) {
					return row[keyProperty] === key;
				})
				.map(function(row) { return JSON.stringify(row); }).value());
			}

			function sendExpiredKey(type, key) {
				var expiredKeyMessage = new Buffer(JSON.stringify(generateKeyObject(type, key)));
				udpClient.send(expiredKeyMessage, 0, expiredKeyMessage.length, port, "localhost");
			}

			it('sends session and cross-application-request messages', function(done) {
				var messages = [];

				var testData = loadTestData('three.json');
				populateRedis('crossApplicationRequest', 'bf42b0ed-b04d-450a-92e8-5a4f9d6efa36', 'crossApplicationRequestId', testData);
				populateRedis('crossApplicationRequest', '3184d9fe-390b-4204-ba38-b4b96f46aea9', 'crossApplicationRequestId', testData);
				populateRedis('crossApplicationRequest', '46fdefcb-339b-40f7-9199-7601a78bb665', 'crossApplicationRequestId', testData);
				populateRedis('session', '104e9439-63de-4373-95ff-6dfa365e4951', 'sessionId', testData);

				sendExpiredKey('crossApplicationRequest', 'bf42b0ed-b04d-450a-92e8-5a4f9d6efa36');
				sendExpiredKey('crossApplicationRequest', '3184d9fe-390b-4204-ba38-b4b96f46aea9');
				sendExpiredKey('crossApplicationRequest', '46fdefcb-339b-40f7-9199-7601a78bb665');
				sendExpiredKey('session', '104e9439-63de-4373-95ff-6dfa365e4951');

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					messages.push(parsedData);

					if(messages.length === 4) {
						var typeCounts = _.countBy(messages, function(item) { return item.type; });

						expect(typeCounts.session || 0).to.be(1);
						expect(typeCounts['cross_application_request'] || 0).to.be(3);

						done();
					}
				});
			});
		});
	});

	describe('event is inputted via amqp', function() {
		var inputExchange;
		var handleTestResult;

		function populateRedisAndSetExpiredKeyMessageViaAmqp(type, key, dataFile) {
			var expiredKeyMessage = new Buffer(JSON.stringify(generateKeyObject(type, key)));
			populateRedisData(type, key, dataFile);

			inputExchange.publish('', expiredKeyMessage);
		}

		function doneExchangeRecievedMessage(routingKey, msg) {
			var data = msg.data.toString('utf-8');
			var parsedData = JSON.parse(data);
			console.log('in');

			if(parsedData.type !== 'session') {
				return;
			}

			handleTestResult(parsedData);
		}

		afterEach(function(done) {
			eventEmitter.removeAllListeners();

			server.stop().then(done.bind(undefined, undefined));

			server = null;

			fakeRedis.clearData();
		});

		beforeEach(function(done) {
			handleTestResult = function() {};

			var mockAmqpServer = amqpSub.mock({ host: '127.0.0.1', port: 5672 })
			inputExchange = mockAmqpServer.exchange('composer-expired');
			outputExchange = mockAmqpServer.exchange('composer-done', doneExchangeRecievedMessage);

			server = new Server();

			server.loadConfig({
				stores: {
					'redis': {
						type: 'redis',
						host: '192.168.50.7',
						port: 6379
					}
				},
				listeners: [
					{ type: 'amqp', "host": "127.0.0.1", "port": 5672, "exchange": "composer-expired", "routing": "expired", "queue": "composer-expired" }
				],
				publishers: [
					{ type: 'amqp', "host": "127.0.0.1", "exchange": "composer-done" }
				]
			}).then(server.start).then(done);

			eventEmitter = new EventEmitter();
		});


		describe('creates new session object', function() {
			it('sets key', function(done) {
				populateRedisAndSetExpiredKeyMessageViaAmqp('session', '104e9439-63de-4373-95ff-6dfa365e4951', 'three.json');

				handleTestResult = function(parsedData) {
					expect(parsedData.sessionId).to.be('104e9439-63de-4373-95ff-6dfa365e4951');
					done();
				};
			});	
		});	
	});	

	describe('config can be loaded from file', function() {
		afterEach(function(done) {
			udpClient.close();
			eventEmitter.removeAllListeners();

			server.stop().then(done.bind(undefined, undefined));

			server = null;

			fakeRedis.clearData();
		});

		beforeEach(function(done) {
			server = new Server();

			server.loadConfigFromFile(__dirname + '/config/test.json')
				.then(server.start)
				.then(done);

			udpClient = dgram.createSocket("udp4");

			udpClient.bind(1235);

			eventEmitter = new EventEmitter();
		});

		it('configures listeners, aggregators and publishers', function(done) {
			populateRedisAndSetExpiredKeyMessage('session', '104e9439-63de-4373-95ff-6dfa365e4951', 'three.json');

			udpClient.on("message", function messageReceived(msg) {
				var data = msg.toString('utf-8');
				var parsedData = JSON.parse(data);

				if(parsedData.type !== 'session') {
					return;
				}

				expect(parsedData.requests.total).to.be(3);
				done();
			});
		});	
	});
});

describe('loggers can be fined through configuration', function() {
	it('registers configured loggers', function(done) {
		var registeredConfig;

		var Server = proxyquire('../lib/server', {
			'./config': proxyquire('../lib/config', {
				'../stores/redis': proxyquire('../lib/stores/redis', {
					'redis': fakeRedis
				}),
				'../logging': {
					registerLogger: function(config) {
						registeredConfig = config;
					},
					forModule: function() { return { logInfo: function() {} } }
				}
			})
		}); 

		var server = new Server();

		server.loadConfig({
			stores: {
				'redis': {
					type: 'redis',
					host: '192.168.50.7',
					port: 6379
				}
			},
			listeners: [
				{ type: 'udp', port: 1234 }
			],
			publishers: [
				{ type: 'udp', host: '127.0.0.1', port: 1235 }
			],
			loggers: [
				{ type: 'logstash', level: 'INFO' }
			]
		}).then(server.start).then(function() {
			expect(registeredConfig).to.eql({
				type: 'logstash', level: 'INFO'
			});

			done();
		});
	});
});
