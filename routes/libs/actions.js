var cheerio = require('cheerio');

// actions per element type
var tables = require('./tables');
var a = require('./a');
var img = require('./img');

var getAll = function(action, html, selector, options) {
	// get all the tags corresponding to 'selector' in 'html' and apply 'action' with 'options'
	var $ = cheerio.load(html);
	var result = [];
	$(selector).each(function(index, element){
		result = result.concat(action(element, options));
	});
	return result;	
}

var Actions = {
	/*
	"action name" :  {
	  label : 'the label shown in UI'
	  , tags: ['table',''] // the specials to look for an array of tags ; '' means no specific tags
		, do: function(html, selector, url) {
			var options = { options for the action funtion to call};
			return getAll(
				action.to.call (mandatory) actions have theil own js module
				, html var (mandatory)
				, selector var (mandatory)
				, options (optional)
			);
		}
	}
	*/

	"pagination" : { // pagination mus be here to populate the select in UI but have no real action
	  label : 'Use those links as pagination links'
	  , tags: ['a']
	}

	, "tables to arrays of text" : {
		  label : 'Store each table as an array of text strings (strip headers if any - html stripped)'
		  , tags: ['table']
			, do: function(html, selector, url) {
				var options = {skipFirstRow: true, smartHeaders: false, stripHtml: true};
				return getAll(tables.getRows, html, selector, options)
			}
	}
	, "tables to arrays of text with headers" : {
	  label : 'Store each table as an array of text strings (use headers if any - html stripped)'
	  , tags: ['table']
		, do: function(html, selector, url) {
			var options = {skipFirstRow: false, smartHeaders: true, stripHtml: true};
			return getAll(tables.getRows, html, selector, options)
		}
	}
	, "tables to arrays of html" :  {
	  label : 'Store each table as an array of HTML strings (strip headers if any)'
	  , tags: ['table']
		, do: function(html, selector, url) {
			var options = {skipFirstRow: true, smartHeaders: false, stripHtml: false};
			return getAll(tables.getRows, html, selector, options)
		}
	}
	, "tables to arrays of html with headers" : {
	  label : 'Store each table as an array of HTML strings (use headers if any)'
	  , tags: ['table']
		, do: function(html, selector, url) {
			var options = {skipFirstRow: false, smartHeaders: true, stripHtml: false};
			return getAll(tables.getRows, html, selector, options)
		}
	}

	// a
	//*******************************************************************************
	/*, "follow and scrap" : { // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TODO
	  label : 'Follow each link and scrap the linked page\'s content (by using another project)'
	  , tags: ['a']
		, do: function(html, selector, url) {
			var options = {};
			return getAll(function(){return []}, html, selector, options)
		}
	}*/
	, "get only href" : {
	  label : 'Get the URL'
	  , tags: ['a']
		, do: function(html, selector, url) {
			var options = {
				getHref: true
				, getText: false
				, stripHtml: false
				, parentUrl: url
			};
			return getAll(a.getA, html, selector, options)
		}
	}
	, "get only link html" : {
	  label : 'Get the links text (outputs html)'
	  , tags: ['a']
		, do: function(html, selector, url) {
			var options = {
				getHref: false
				, getText: true
				, stripHtml: false
				, parentUrl: url
			};
			return getAll(a.getA, html, selector, options)
		}
	}
	, "get only link text" : {
	  label : 'Get the links text (strip html)'
	  , tags: ['a']
		, do: function(html, selector, url) {
			var options = {
				getHref: false
				, getText: true
				, stripHtml: true
				, parentUrl: url
			};
			return getAll(a.getA, html, selector, options)
		}
	}
	, "get href and html" : {
	  label : 'Get the URL and the links text (stored in separates columns)'
	  , tags: ['a']
		, do: function(html, selector, url) {
			var options = {
				getHref: true
				, getText: true
				, stripHtml: false
				, parentUrl: url
			};
			return getAll(a.getA, html, selector, options)
		}
	}
	, "get href and text (strip html)" : {
	  label : 'Get the URL and the links text (stored in separates columns)'
	  , tags: ['a']
		, do: function(html, selector, url) {
			var options = {
				getHref: true
				, getText: true
				, stripHtml: true
				, parentUrl: url
			};
			return getAll(a.getA, html, selector, options)
		}
	}

	// img
	//*******************************************************************************
	, "get src" : {
	  label : 'Get the image URL'
	  , tags: ['img']
		, do: function(html, selector, url) {
			var options = {
				toDataUrl: false
				, parentUrl: url
			};
			return getAll(img.getImg, html, selector, options)
		}
	}
	, "get data url" : {
	  label : 'Store the image as a data url'
	  , tags: ['img']
		, do: function(html, selector, url) {
			var options = {
				toDataUrl: true
				, parentUrl: url
			};
			return getAll(img.getImg, html, selector, options)
		}
	}

	// p
	//*******************************************************************************
	, "get text content" : {
	  label : 'Get the text (each content is stored separately - HTML is stripped)'
	  , tags: ['p','']
		, do: function(html, selector, url) {
			var options = {};
			return getAll(function(){return []}, html, selector, options)
		}
	}
	, "get concatenated text content" : {
	  label : 'Get the text (contents are concatenated - HTML is stripped)'
	  , tags: ['p','']
		, do: function(html, selector, url) {
			var options = {};
			return getAll(function(){return []}, html, selector, options)
		}
	}
	, "get html content" : {
	  label : 'Get the HTML (each content is stored separately)'
	  , tags: ['p','']
		, do: function(html, selector, url) {
			var options = {};
			return getAll(function(){return []}, html, selector, options)
		}
	}
	, "get concatenated html content" : {
	  label : 'Get the HTML (contents are concatenated)'
	  , tags: ['p','']
		, do: function(html, selector, url) {
			var options = {};
			return getAll(function(){return []}, html, selector, options)
		}
	}
};

module.exports = Actions;