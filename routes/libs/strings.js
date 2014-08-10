var Entities = require('html-entities').AllHtmlEntities,
	entities = new Entities();

var stripHtml = function(str) {
	// strip html tags and entities
	return entities.decode(
			str.replace(/(<([^>]+)>)/ig,'').trim()
		);
}

module.exports.stripHtml = stripHtml;
