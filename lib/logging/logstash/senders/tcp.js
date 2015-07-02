var net = require('net');

module.exports = function tcpSender(config) {
	var client = new net.Socket();

	client.on('error', function (e) {
		console.log('CLIENT ERROR!!! ' + e);
	});

	client.connect(config.port, config.host, function(socket) {
		console.log('connected...')
	});

	return function(data) {
		var message = JSON.stringify(data);

		client.write(message);
	}
};