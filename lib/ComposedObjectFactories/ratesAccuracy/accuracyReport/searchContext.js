var logging = require('../../../logging').forModule('Rates Accuracy Check');
var _ = require('lodash');

function replaceDashes(input) {
	if(!input) { 
		return input; 
	}

	return input.replace(/\-/g, ' ')
}

var searchTypeRegex = /^(ks?|rs?)/i;

var searches = {
	'ks': { mapper: setQuickSearch.bind(undefined, 'keyword', /^ks([0-9]+)_([A-Z0-9\-]+)_([A-Z\- ]+)(\-p([0-9]+))?\.aspx$/i) },
	'k': { mapper: setStandardSearch.bind(undefined, 'keyword', /^k([0-9]+)_([A-Z0-9\- ]+)\-hotels(\-p([0-9]+))?\.aspx$/i ) },
	'rs': { mapper: setQuickSearch.bind(undefined, 'region', /^rs([0-9]+)_([A-Z\-]+)_([A-Z\- ]+)(\-p([0-9]+))?\.aspx$/i) },
	'r': { mapper: setStandardSearch.bind(undefined, 'region', /^r([0-9]+)_hotels\-in\-([A-Z\- ]+)(\-p([0-9]+))?\.aspx$/i) }
};

function setStandardSearch(type, regex, url) {
	var obj = {};
	var matches = regex.exec(url);

	obj[type + 'Id'] = parseInt(matches[1], 10);
	obj[type] = replaceDashes(matches[2]);
	obj.isQuickSearch = false;
	obj.type = type;
	obj.pageNumber = matches[4] ? parseInt(matches[4], 10) : 1;

	return obj;
}

function setQuickSearch(type, regex, url) {
	var obj = {};
	var matches = regex.exec(url);

	obj[type + 'Id'] = parseInt(matches[1], 10);
	obj[type] = replaceDashes(matches[3]);
	obj.quickSearchType = replaceDashes(matches[2]);
	obj.isQuickSearch = true;
	obj.type = type;	

	obj.pageNumber = matches[5] ? parseInt(matches[5], 10) : 1;

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

		if(!searchTypeMatch) {
			return {
				type: 'text',
				term: term
			};
		}

		var searchType = searchTypeMatch[0];
		var createObject = searches[searchType].mapper;

		return _.merge({
			term: term
		}, createObject(url));
	}
	catch(e) {
		logging.logError('Error building rates accuracy check search context: ' + e.message, {
			exception: e, 
			url: url
		});
	}
}
