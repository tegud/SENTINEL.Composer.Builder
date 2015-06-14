var pmessageHandler;
var subscribedEvents = {};

var data = {};

module.exports = {
	createClient: function() {
		var store = {};
		var expiries = {};

		function timeoutExpiry(key) {
			if(subscribedEvents['__keyevent@0*__:expired']) {
				pmessageHandler('__keyevent@0*__:expired', '__keyevent@0__:expired', key);
			}
		}

		return {
			psubscribe: function(event) {
				subscribedEvents[event] = true;
			},
			punsubscribe: function(event) {
				subscribedEvents[event] = false;
			},
			on: function(event, handler) {
				if(event === 'pmessage') {
					pmessageHandler = handler;
				}

				if(event === 'ready') {
					handler();
				}
			},
			quit: function() {
				pmessageHandler = undefined;
			},
			set: function(key, value) {
				store[key] = value;
			},
			expire: function(key, timeout) {
				if(expiries[key]) {
					clearTimeout(expiries[key]);
				}

				expiries[key] = setTimeout(timeoutExpiry.bind(undefined, key), timeout)
			},
			lrange: function(key, start, end, callback) {
				if(!start && end === -1) {
					return callback(null, data[key]);
				}

				callback();
			},
			del: function(key) {

			}
		};
	},
	setKeyData: function(key, keyData) {
		data[key] = keyData;
	},
	clearData: function() {
		data = {};
	}
};
