var Promise = require('bluebird');
var amqp = require('amqp');

module.exports = function AmqpListener(eventEmitter, logger, config) {
	var connection;
	var connected;
	
	logger.logInfo('Initialising Rabbit MQ listener');

	function connectionReady(resolve, reject, connection) {
		if(connected) { 
			return;
		}

		connected = true;
		logger.logInfo('Connected to Rabbit MQ');

		connection.queue(config.queue, { autoDelete: false }, queueReady.bind(undefined, resolve));
	}

	function queueReady(resolve, queue) {
		logger.logInfo('Connected to Queue');
		queue.bind(config.exchange, config.routing);
		
		queue.subscribe({ ack: true }, messageReceived.bind(undefined, queue));

		resolve();
	}

	function messageReceived(queue, msg) {
		logger.logDebug('Message received', { msg: msg });

		eventEmitter.emit('listenerEventReceived', JSON.parse(msg.data.toString('utf-8')));
		queue.shift();
	}

	function startUp(eventEmitter, resolve, reject) {
		var options = { host: config.host };

		if(config.port) {
			options.port = config.port;
		}

		var connection = amqp.createConnection(options);

		logger.logInfo('Connecting to Rabbit MQ', options);

		connection.on('ready', connectionReady.bind(undefined, resolve, reject, connection));
	}

	function start(eventEmitter) {
		return new Promise(startUp.bind(undefined, eventEmitter));
	}

	return {
		start: start
	};
};
