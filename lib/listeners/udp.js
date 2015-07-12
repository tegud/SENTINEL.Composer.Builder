var Promise = require('bluebird');
var dgram = require("dgram");

function parseMessage(msg) {
	return new Promise(function(resolve, reject) {
		var data = msg.toString('utf-8');
		var prasedData = JSON.parse(data);

		resolve(prasedData);
	});
}

function onError(logger, error) {
	logger.logError('Error receiving UDP packet: ' + error.stack);
}

function startedListening(logger, resolve, port) {
	logger.logInfo("Listening on port: " + port);

	resolve();
}

module.exports = function UdpListener(eventEmitter, logging, config) {
	var logger = logging.forModule('UDP Listener');
	var udpClient = dgram.createSocket("udp4");

	function emitEvent(message) {
		eventEmitter.emit('listenerEventReceived', message);
	}

	function start() {
		return new Promise(startUp);
	}

	function startUp(resolve, reject) {
		udpClient.on("error", onError.bind(undefined, logger));
		udpClient.on("message", function(message) {
			parseMessage(message)
				.then(emitEvent)
				.catch(SyntaxError, function(err) {
					logger.logError('Could not parse message "' + message + '" correctly')
				});
		});
		udpClient.on("listening", startedListening.bind(undefined, logger, resolve, config.port));

		udpClient.bind(config.port);
	}

	function shutDown(resolve, reject) {
		logger.logInfo("Stopping listening on port: " + config.port);
		udpClient.close();

		resolve();
	}

	function stop() { 
		return new Promise(shutDown); 
	}

	return {
		start: start,
		stop: stop
	}
};
