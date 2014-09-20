var cheerio = require('cheerio');
var strings = require('./strings');
var urls = require('url');
var optionsUtils = require('./options');

var getA = function(a, options) {
	// get options
	var defaultOptions = {
		getHref: true
		, getText: true
		, stripHtml: true
		, parentUrl: ''
	};
	var options = optionsUtils.set(defaultOptions, options);

	// load the html in cheerio $
	var $ = cheerio.load(a);

	var href = $('a').attr('href');

	var url = urls.parse(href, true);
	if (!url.hostname) {
		var href = urls.resolve(options.parentUrl, href);
	}

	var html = $('a').html();

	var text = $('a').text();

	if (options.getHref && options.getText) {
		var ret = {};
		ret.url = href;
		if (options.stripHtml) {
			ret.link = text;
		} else {
			ret.link = html;
		}
	} else {
		if (options.getHref) {
			var ret = {url:href};
		} else {
			if (options.stripHtml) {
				var ret = {link:text};
			} else {
				var ret = {link:html};
			}
		}
	}
	return [ret];
}

module.exports.getA = getA;