var logging = require('../../../logging').forModule('Rates Accuracy Check');
var _ = require('lodash');

function replaceDashes(input) {
	if(!input) { 
		return input; 
	}

	return input.replace(/\-/g, ' ')
}

var searchTypeRegex = /^(ks?|rs?)/i;

var regexLookup = {
	k: /^k([0-9]+)_([A-Z\- ]+)\-hotels\.aspx$/i,
	ks: /^ks([0-9]+)_([A-Z\-]+)_([A-Z\- ]+)\.aspx$/i,
	r: /^r([0-9]+)_hotels\-in\-([A-Z\- ]+)\.aspx$/i,
	rs: /^rs([0-9]+)_([A-Z\-]+)_([A-Z\- ]+)\.aspx$/i
};

var mapperLookup = {
	'ks': setQuickSearch.bind(undefined, 'keyword'),
	'k': setStandardSearch.bind(undefined, 'keyword'),
	'rs': setQuickSearch.bind(undefined, 'region'),
	'r': setStandardSearch.bind(undefined, 'region')
};

function setStandardSearch(type, matches) {
	var obj = {};

	obj[type + 'Id'] = parseInt(matches[1], 10);
	obj[type] = replaceDashes(matches[2]);
	obj.isQuickSearch = false;
	obj.type = type;

	return obj;
}

function setQuickSearch(type, matches) {
	var obj = {};

	obj[type + 'Id'] = parseInt(matches[1], 10);
	obj[type] = replaceDashes(matches[3]);
	obj.quickSearchType = replaceDashes(matches[2]);
	obj.isQuickSearch = true;
	obj.type = type;	

	return obj;
}

module.exports = function buildSearchContext(serverSearchContext) {
	if(!serverSearchContext) {
		return;
	}

	try {
		var url = serverSearchContext.url_page.substring(1);
		var searchTypeMatch = searchTypeRegex.exec(url);
		var term = serverSearchContext.url_querystring_k;

		if(searchTypeMatch) {
			var searchType = searchTypeMatch[0];
			var createObject = mapperLookup[searchType];
			var regexMatches = regexLookup[searchType].exec(url);

			return _.merge({
				term: term
			}, createObject(regexMatches));
		}

		return {
			type: 'text',
			term: term
		};
	}
	catch(e) {
		logging.logError('Error building rates accuracy check search context: ' + e.message, {
			exception: e, 
			url: url
		});
	}
}
