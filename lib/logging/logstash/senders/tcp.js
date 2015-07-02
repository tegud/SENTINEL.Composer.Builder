var net = require('net');

module.exports = function tcpSender(config) {
	var client = new net.Socket();

	client.on('error', function (e) {
		console.log('CLIENT ERROR!!! ' + e.code);
	});

	client.connect(config.port, config.host, function() {
		console.log('connected...')
	});


	return function(data) {
		var message = JSON.stringify(data);

		client.write(message);
	}
};