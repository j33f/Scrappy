var cheerio = require('cheerio');
var Entities = require('html-entities').AllHtmlEntities,
	entities = new Entities();

var stripTags = function(str) {
	return entities.decode(
			str.replace(/(<([^>]+)>)/ig,'').trim()
		);
}

var Actions = {
	"tables to arrays of text" : 
		function(html, selector) {
			var $ = cheerio.load(html);
			var result = [];
			$(selector).each(function(index, element){
				var table = [];
				$(element).find('tr').each(function(i,e){
					if (i>0) {
						var tr = [];
						$(e).find('td').each(function(){
							tr.push(stripTags($(this).html()));
						});
						table.push(tr);
					}
				});
				result.push(table);
			});
			return result;
		}
};

module.exports = Actions;