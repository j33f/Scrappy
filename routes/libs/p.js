var cheerio = require('cheerio');
var strings = require('./strings');
var urls = require('url');
var optionsUtils = require('./options');

var getP = function(p, options) {
	// get options
	var defaultOptions = {
		stripHtml: true,
		selector: 'p'
	};
	var options = optionsUtils.set(defaultOptions, options);

	// load the html in cheerio $
	var $ = cheerio.load(p);

	// get the last tag from the selector in order to handel all the tags, not only p
	var _selector = options.selector.split(' ');
	var lastSelector = _selector[_selector.length-1];
	var tag = lastSelector.replace(/^([a-z]*):.*$/, '$1') ;

	var html = $(tag).get();

	var text = $(tag).text() + '\n';

	if (options.stripHtml) {
		var ret = {content:text};
	} else {
		var ret = {content:html};
	}

	return [ret];
}

module.exports.getP = getP;