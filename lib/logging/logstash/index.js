var moment = require('moment');
var _ = require('lodash');
var dgram = require('dgram');
var net = require('net');

var senders = {
	'udp': function udpSender(config) {
		var udpClient = dgram.createSocket("udp4");

		return function(data) {
			var message = JSON.stringify(data);

			udpClient.send(message, 0, message.length, config.port, config.host);
		}
	},
	'tcp': function tcpSender(config) {
		var client = new net.Socket();

		client.connect(9990, '127.0.0.1');

		return function(data) {
			var message = JSON.stringify(data);

			client.write(message);
		}
	}
};

function getLogstashType(config, level) {
	if(typeof config === 'string') {
		return config;
	}

	level = level.toLowerCase();

	return config.prefix + _.get(config, 'overrides.' + level, level);
}

module.exports = function LogstashLogger(config) {
	var send = new senders[config.output.transport](config.output);
	var getType = getLogstashType.bind(undefined, config.type);
	
	return function(level, module, message, data) {
		var message = {
			type: getType(level),
			message: message
		};

		send(message);
	};
}
