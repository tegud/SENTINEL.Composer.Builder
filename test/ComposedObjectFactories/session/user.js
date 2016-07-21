var expect = require('expect.js');
var buildUser = require('../../../lib/ComposedObjectFactories/session/user');

describe('buildUser', function() {
	describe('sets user.type', function() {
		it('to GoodBot if any request User Agent identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {}, UA_is_bot: "true" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('GoodBot');
		});

		it('to BadBot if any request Bot Buster score identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {}, botBuster_score: "150" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('BadBot');
		});

		it('to BadBot if any request Bot Buster v2 identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: { bbv2_block: "yes" } },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('BadBot');
		});

		it('to Human if no request User Agent or Bot Buster Score identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {} },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('Human');
		});
	});

	describe('sets user.botIdentifiedBy', function() {
		it('to undefined if user is human', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {} },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).botIdentifiedBy).to.be(undefined);
		});

		it('to UserAgent if user is GoodBot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {}, UA_is_bot: "true" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).botIdentifiedBy).to.be("UserAgent");
		});

		it('to BotBusterV1 if user is BadBot because botBuster_score is not 0', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {}, botBuster_score: "150" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).botIdentifiedBy).to.be("BotBusterV1");
		});

		it('to BotBusterV1 if BadBot because bbv2_block is yes', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: { bbv2_block: "yes" } },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).botIdentifiedBy).to.be("BotBusterV2");
		});

		it('to "BotBusterV1 BotBusterV2" if BadBot because bbv2_block is yes and botBuster_score is not 0', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: { bbv2_block: "yes" } },
					{ type: 'lr_varnish_request', req_headers: {}, botBuster_score: "150" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).botIdentifiedBy).to.be("BotBusterV1 BotBusterV2");
		});
	});
});
