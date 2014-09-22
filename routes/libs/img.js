var cheerio = require('cheerio');
var urls = require('url');
var request = require('request');
var optionsUtils = require('./options');
var httpSync;
try {
  httpSync = require('http-sync');
} catch (e) {
  httpSync = require('http-sync-win');
}


var getImg = function(img, options) {
	// get options
	var defaultOptions = {
		toDataUrl: false
		, parentUrl: ''
	};
	var options = optionsUtils.set(defaultOptions, options);

	// load the html in cheerio $
	var $ = cheerio.load(img);

	var src = $('img').attr('src');

	if (!src.match(/^data:/)) {
		var _url = urls.parse(src, true);
		if (!_url.hostname) {
			var url = urls.resolve(options.parentUrl, src);
		} else {
			var url = src;
		}

		if (options.toDataUrl) {
			
			var parsedUrl = urls.parse(url);

			var syncRequest = httpSync.request({
			    method: 'GET',
			    headers: {},
			    body: '',

			    protocol: parsedUrl.protocol.replace(':',''),
			    host: parsedUrl.hostname,
			    port: parsedUrl.port,
			    path: parsedUrl.path
			});
			var response = syncRequest.end();
			if (response.statusCode == 200) {
				var contentType = response.headers['content-type'] || response.headers['Content-Type'];
				return [{src: 'data:' + contentType + ';base64,' + response.body.toString('base64')}];
			} else {
				return [{src: response.statusCode + ' Error.'}];
			}
		} else {
			return [{src: url}];
		}
	} else {
		return [{src:src}];
	}

}

module.exports.getImg = getImg;