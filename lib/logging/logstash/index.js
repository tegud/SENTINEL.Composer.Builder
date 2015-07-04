var moment = require('moment');
var _ = require('lodash');
var net = require('net');
var moment = require('moment');

function getLogstashType(config, level) {
	if(typeof config === 'string') {
		return config;
	}

	level = level.toLowerCase();

	return config.prefix + _.get(config, 'overrides.' + level, level);
}

function mapConflictingDataProperties(data, baseObject) {
	if(!data) {
		return;
	}

	_.each(baseObject, function(value, key) {
		if(!data[key]) {
			return;
		}

		var newKey;

		if(key === '@timestamp') {
			newKey = 'additionalTimestamp';
		}
		else {
			newKey = 'additional' + key.substring(0, 1).toUpperCase() + key.substring(1);
		}

		data[newKey] = data[key];
	});

	return data;
}

function buildMessage(getType, codec, level, module, message, data) {
	if(codec === 'oldlogstashjson') {
		if(!data) {
			data = {};
		}

		data.module = module;

		return {
			'@timestamp': moment().format(),
			'@type': getType(level),
			'@message': message,
			'@fields': data
		};
	}

	var baseObject = {
		'@timestamp': moment().format(),
		type: getType(level),
		module: module,
		message: message
	};

	return _.merge({}, mapConflictingDataProperties(data, baseObject), baseObject);
}

module.exports = function LogstashLogger(config) {
	var send = new require('./senders/' + config.output.transport)(config.output);
	var getType = getLogstashType.bind(undefined, config.eventType);
	var buildMessageWithGetType = buildMessage.bind(undefined, getType, config.codec);
	
	return function(level, module, message, data) {
		var message = buildMessageWithGetType(level, module, message, data);

		send(message);
	};
}
