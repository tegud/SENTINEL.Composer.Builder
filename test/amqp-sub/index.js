var amqp = require('amqp');
var logger = require('../../lib/logging').forModule('AMQP Mock Server');
var events = require('events');
var _ = require('lodash');

var originalCreateConnection = amqp.createConnection;

var interceptedConnections = {};
var queues = {};
var exchanges = {};

function createConnectionIntercept(options) {
	var connectionKey = generateConnectionKey(options);
	if(interceptedConnections[generateConnectionKey(options)]) {
		logger.logInfo('Create Connection intercepted.', { key: connectionKey });

		return interceptedConnections[generateConnectionKey(options)].createConnection(options);
	}

	logger.logInfo('Create Connection with no interception.', { key: connectionKey, interceptedKeys: Object.keys(interceptedConnections.join(',')) });
	return originalCreateConnection(options);
}

function generateConnectionKey(options) {
	return options.host + ':' + (options.port || 5672);
}

function QueueIntercept(queueName, options) {
	var subscriptions = [];

	return { 
		name: queueName, 
		options: options, 
		api: {
			bind: function(exchange, routingKey) {
				if(!exchanges[exchange]) {
					throw new Error('Could not find exchange: ' + exchange);
				}

				logger.logInfo('Queue Bound to exchange', { queue: queueName, exchange: exchange });
				exchanges[exchange].boundQueues.push(queueName)
			},
			subscribe: function (subscriptionOptions, messageHandler) {
				subscriptions.push({ options: subscriptionOptions, handler: messageHandler });
			},
			shift: function() {
				logger.logInfo('Subscriber acknowledged.');
			}
		},
		publish: function(message) {
			_.each(subscriptions, function(subscription) {
				logger.logInfo('Sending message to subscriber', { message: message });
				subscription.handler({ data: message });
			});
		}
	};
}

function ConnectionIntercept(options) {
	var eventEmitter = new events.EventEmitter();

	return {
		createConnection: function(options) {
			logger.logInfo('Allowing connection');

			setImmediate(function() {
				logger.logInfo('Sending ready event');
				eventEmitter.emit('ready');
			});

			return {
				queue: function(queueName, options, callback) {
					if(queues[queueName]) {
						logger.logInfo('Queue already exists.', { queue: queueName });
					}
					else {
						logger.logInfo('Queue Created', { queue: queueName, options: options });
						queues[queueName] = new QueueIntercept(queueName, options);
					}

					callback(queues[queueName].api);
				},
				exchange: function(name, options, callback) {
					logger.logInfo('Exchange Created', { queue: name, options: options });

					callback({
						publish: function(routingKey, message) {
							if(exchanges[name].messageInterceptor) {
								logger.logInfo('Message Intercepted to exchange', { exchange: name });
								exchanges[name].messageInterceptor(routingKey, { data: message });
							}
						}
					});
				},
				close: function() {},
				on: function(eventName, handler) {
					logger.logInfo('Client subscribed to event: ' + eventName);

					eventEmitter.on(eventName, handler);
				}
			};
		},
		api: {
			exchange: function(exchangeName, messageReceivedCallback) {
				exchanges[exchangeName] = {
					boundQueues: [],
					messageInterceptor: messageReceivedCallback
				};

				return {
					publish: (function(routingKey, message) {
						logger.logInfo('Event published to exchange', { exchange: exchangeName, routingKey: routingKey });

						if(!this.boundQueues.length) {
							throw new Error('Queue implementation todo.')
							return logger.logInfo('No bound queues, message queued');
						}

						_.each(this.boundQueues, function(queue) {
							logger.logInfo('Publishing message to bound queue', { queue: queue });

							queues[queue].publish(message);
						});
					}).bind(exchanges[exchangeName])
				};
			}
		}
	};
}

amqp.createConnection = createConnectionIntercept;

module.exports = {
	mock: function(options) {
		var connectionKey = generateConnectionKey(options);
		
		if(!interceptedConnections[connectionKey]) {
			interceptedConnections[connectionKey] = new ConnectionIntercept(options);
		}

		return interceptedConnections[connectionKey].api;
	}
}
