var Entities = require('html-entities').AllHtmlEntities,
	entities = new Entities();

var stripTags = function(str) {
	return entities.decode(
			str.replace(/(<([^>]+)>)/ig,'').trim()
		);
}

module.exports.stripTags = stripTags;