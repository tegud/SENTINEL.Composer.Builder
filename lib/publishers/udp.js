var Promise = require('bluebird');
var dgram = require("dgram");

module.exports = function(options) {
	var udpClient;
	
	return {
		start: function(eventEmitter) {
			return new Promise(function(resolve, reject) {
				udpClient = dgram.createSocket("udp4");
				
				eventEmitter.on('builtObjectComplete', function(data) {
					var message = new Buffer(JSON.stringify(data));

					udpClient.send(message, 0, message.length, options.port, options.host, function() { });
				});

				resolve();
			});
		}
	};
};
