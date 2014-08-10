var cheerio = require('cheerio');

var tables = require('./tables');

var getAll = function(action, html, selector, options) {
	// get all the elements corresponding to 'selector' in 'html' and apply 'action' with 'options'
	var $ = cheerio.load(html);
	var result = [];
	$(selector).each(function(index, table){
		result.push(action($(table).html(), options));
	});
	return result;	
}

var Actions = {
	"_Model" : 
		function(html, selector) {
			/*
			Model of all actions
			var options = { options for the action funtion to call};
			return getAll(
				action.to.call (mandatory)
				, html var (mandatory)
				, selector var (mandatory)
				, options (optional)
			);
			*/
			return null;
		}

	// Tables
	//*******************************************************************************

	, "tables to arrays of text" : 
		function(html, selector) {
			var options = {skipFirstRow: true, smartHeaders: false, stripTags: true};
			return getAll(tables.getRows, html, selector, options)
		}
	, "tables to arrays of text with headers" : 
		function(html, selector) {
			var options = {skipFirstRow: false, smartHeaders: true, stripTags: true};
			return getAll(tables.getRows, html, selector, options)
		}

	, "tables to arrays of html" : 
		function(html, selector) {
			var options = {skipFirstRow: true, smartHeaders: false, stripTags: false};
			return getAll(tables.getRows, html, selector, options)
		}
	, "tables to arrays of html with headers" : 
		function(html, selector) {
			var options = {skipFirstRow: false, smartHeaders: true, stripTags: false};
			return getAll(tables.getRows, html, selector, options)
		}
};

module.exports = Actions;