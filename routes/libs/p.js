var cheerio = require('cheerio');
var strings = require('./strings');
var urls = require('url');
var optionsUtils = require('./options');

var getP = function(p, options) {
	// get options
	var defaultOptions = {
		stripHtml: true
	};
	var options = optionsUtils.set(defaultOptions, options);

	// load the html in cheerio $
	var $ = cheerio.load(p);

	var html = '<p>' + $('p').html() + '</p>';

	var text = $('p').text() + '\n';

	if (options.stripHtml) {
		var ret = {content:text};
	} else {
		var ret = {content:html};
	}

	return [ret];
}

module.exports.getP = getP;