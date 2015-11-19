var _ = require('lodash');


function getUserTypeFromLastRequest(requests) {
	if(_.some(requests, function(request) { return request.UA_is_bot == "true"; })) {
		return { userType: 'GoodBot', identifiedBy: 'UserAgent' };
	}

	var isBotBusterV1 = _.some(requests, function(request) { return typeof request.botBuster_score !== "undefined" && request.botBuster_score != "0"; });
	var isBotBusterV2 = _.some(requests, function(request) { return request.req_headers && typeof request.req_headers.bbv2_block !== "undefined" && request.req_headers.bbv2_block === "yes"; });

	if(isBotBusterV1 || isBotBusterV2) {
		var identifiedBy;

		if(isBotBusterV1 && isBotBusterV2) {
			identifiedBy = 'BotBusterV1 BotBusterV2';
		}
		else {
			identifiedBy = isBotBusterV1 ? 'BotBusterV1' : 'BotBusterV2';
		}

		return { userType: 'BadBot', identifiedBy: identifiedBy };
	}

	return { userType: 'Human' };
}

module.exports = function(sessionLog) {
	var requests = _.filter(sessionLog.events, function(item) { return item.type === 'lr_varnish_request'; });
	var lastRequest = _.last(requests);

	if(!requests.length) {
		return;
	}

	var geoIpInfo = lastRequest["geoip"] ? JSON.parse(JSON.stringify(lastRequest["geoip"])) : {};
	var botDetails = getUserTypeFromLastRequest(requests);

	delete geoIpInfo['ip'];

	return {
		ip: {
			address: lastRequest["ip"],
			organisation: lastRequest["organisation"],
			geoip: geoIpInfo
		},
		userAgent: {
			full: lastRequest['req_headers']['User_Agent'],
			name: lastRequest['UA_name'],
			os: lastRequest['UA_os'],
			osName: lastRequest['UA_os_name'],
			device: lastRequest['UA_device'],
			major: lastRequest['UA_major'],
			minor: lastRequest['UA_minor']
		},
		type: botDetails.userType,
		botIdentifiedBy: botDetails.identifiedBy
	};
};
