var moment = require('moment');
var _ = require('lodash');
var net = require('net');

function getLogstashType(config, level) {
	if(typeof config === 'string') {
		return config;
	}

	level = level.toLowerCase();

	return config.prefix + _.get(config, 'overrides.' + level, level);
}

function buildMessage(getType, level, module, message, data) {
	return {
		type: getType(level),
		message: message
	}
}

module.exports = function LogstashLogger(config) {
	var send = new require('./senders/' + config.output.transport)(config.output);
	var getType = getLogstashType.bind(undefined, config.type);
	var buildMessageWithGetType = buildMessage.bind(undefined, getType);
	
	return function(level, module, message, data) {
		var message = buildMessageWithGetType(level, module, message, data);

		send(message);
	};
}
