var cheerio = require('cheerio');
var strings = require('./strings');
var optionsUtils = require('./options');

var getRows = function(table, options) {
	var _options = {
		skipFirstRow: false
		, smartHeaders: true
		, stripTags: true
	};
	var options = optionsUtils.set(_options, options);
	console.log(options);

	var $ = cheerio.load(table);

	var rows = [];
	var headers = [];

	$('tr').each(function(i,e){
		if (i == 0) {
			if (options.smartHeaders) {
				// collect the first row header to create an object in wich keys are the table headers
				if (headers.length == 0) {
					$(e).find('td, th').each(function(){
						headers.push(strings.stripTags($(this).html()));
					});
				}
				return;
			}
			if (options.skipFirstRow) return;
		} else {
			if (headers.length) {
				var tr = {};
			} else {
				var tr = [];
			}
			$(e).find('td, th').each(function(key, element){
				var cell = $(this).html();
				if (options.stripTags) {
					cell = strings.stripTags(cell);
				}
				if (headers.length) {
					tr[headers[key]] = cell;
				} else {
					tr.push(cell);
				}
			});
			rows.push(tr);
		}
	});
	return rows;
};

module.exports.getRows = getRows;