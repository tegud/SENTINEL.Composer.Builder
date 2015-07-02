var net = require('net');

module.exports = function tcpSender(config) {
	var client = new net.Socket();

	client.connect(config.port, config.host);

	return function(data) {
		var message = JSON.stringify(data);

		client.write(message);
	}
};