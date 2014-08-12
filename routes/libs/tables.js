var cheerio = require('cheerio');
var strings = require('./strings');
var optionsUtils = require('./options');

var getRows = function(table, options) {
	// get options
	var defaultOptions = {
		skipFirstRow: false
		, smartHeaders: true
		, stripHtml: true
	};
	var options = optionsUtils.set(defaultOptions, options);

	// load the html in cheerio $
	var $ = cheerio.load(table);

	// instantiate the vars
	var rows = []; // all rows
	var headers = []; // headers

	$('tr').each(function(i,e){
		// for each row
		if (i == 0) {
			// we are at the first row
			if (options.smartHeaders) {
				// collect the first row header to create an object in wich keys are the table headers and exit
				if (headers.length == 0) {
					$(e).find('td, th').each(function(){
						headers.push(strings.stripHtml($(this).html()));
					});
				}
				return;
			}
			if (options.skipFirstRow) return; // we must skip this row
		} else {
			if (headers.length) { // if we have headers, the tr var wich will store the current row have to be an object
				var tr = {};
			} else {
				var tr = []; // no headers, store the row into a simple array
			}
			$(e).find('td, th').each(function(key, element){
				// for each cells in this row
				var cell = $(this).html(); // store the html content

				if (options.stripHtml) { // strip the tags if needed
					cell = strings.stripHtml(cell);
				}
				if (headers.length) { // we have headers, so lets store the cell into the right property of the tr object
					tr[headers[key]] = cell;
				} else { // no header, push to the array
					tr.push(cell);
				}
			});
			rows.push(tr); // push to the rows array
		}
	});
	return rows;
};

module.exports.getRows = getRows;