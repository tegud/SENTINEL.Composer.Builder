var Promise = require('bluebird');
var dgram = require("dgram");
var logger = require('../logging').forModule('UDP Listener');
var Promise = require('bluebird');

module.exports = function UdpListener(config) {
	var udpClient = dgram.createSocket("udp4");

	function onError(error) {
		logger.logError('Error receiving UDP packet: ' + error.stack);
	}

	function startedListening(resolve) {
		logger.logInfo("Listening on port: " + config.port);

		resolve();
	}

	function parseMessage(msg) {
		return new Promise(function(resolve, reject) {
			var data = msg.toString('utf-8');
			var prasedData = JSON.parse(data);

			resolve(prasedData);
		});
	}

	function emitEvent(eventEmitter, message) {
		eventEmitter.emit('listenerEventReceived', message);
	}

	function startUp(eventEmitter, resolve, reject) {
		udpClient.on("error", onError);
		udpClient.on("message", function(message) {
			parseMessage(message)
				.then(emitEvent.bind(undefined, eventEmitter))
				.catch(SyntaxError, function(err) {
					logger.logError('Could not parse message "' + message + '" correctly')
				});
		});
		udpClient.on("listening", startedListening.bind(undefined, resolve));

		udpClient.bind(config.port);
	}

	function shutDown(resolve, reject) {
		logger.logInfo("Stopping listening on port: " + config.port);
		udpClient.close();

		resolve();
	}

	function start(eventEmitter) { 
		return new Promise(startUp.bind(undefined, eventEmitter)); 
	}

	function stop() { 
		return new Promise(shutDown); 
	}

	return {
		start: start,
		stop: stop
	}
};
