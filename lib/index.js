var server = require('./server');

new server({
	stores: {
		'redis': {
			type: 'redis',
			host: '192.168.50.7',
			port: 6379
		}
	},
	listeners: [
		{ type: 'amqp', host: '10.44.72.40', queue: 'composer-expired' }
	],
	publishers: [
		{ type: 'amqp', host: '10.44.72.40', exchange: 'composer-done' }
	]
}).start();
