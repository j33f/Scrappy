var cheerio = require('cheerio');

var tables = require('./tables');

var getAll = function(action, html, selector, options) {
	// get all the elements corresponding to 'selector' in 'html' and apply 'action' with 'options'
	var $ = cheerio.load(html);
	var result = [];
	$(selector).each(function(index, table){
		result = result.concat(action($(table).html(), options));
	});
	return result;	
}

var Actions = {
	/*
	"action name" : 
		function(html, selector) {
			Model of all actions
			var options = { options for the action funtion to call};
			return getAll(
				action.to.call (mandatory)
				, html var (mandatory)
				, selector var (mandatory)
				, options (optional)
			);
		}
	*/
	// Tables
	//*******************************************************************************

	  "tables to arrays of text" : 
		function(html, selector) {
			var options = {skipFirstRow: true, smartHeaders: false, stripHtml: true};
			return getAll(tables.getRows, html, selector, options)
		}
	, "tables to arrays of text with headers" : 
		function(html, selector) {
			var options = {skipFirstRow: false, smartHeaders: true, stripHtml: true};
			return getAll(tables.getRows, html, selector, options)
		}

	, "tables to arrays of html" : 
		function(html, selector) {
			var options = {skipFirstRow: true, smartHeaders: false, stripHtml: false};
			return getAll(tables.getRows, html, selector, options)
		}
	, "tables to arrays of html with headers" : 
		function(html, selector) {
			var options = {skipFirstRow: false, smartHeaders: true, stripHtml: false};
			return getAll(tables.getRows, html, selector, options)
		}
};

module.exports = Actions;