var dgram = require('dgram');

module.exports = function udpSender(config) {
	var udpClient = dgram.createSocket("udp4");

	return function(data) {
		var message = JSON.stringify(data);

		udpClient.send(new Buffer(message), 0, message.length, config.port, config.host);
	}
};
