var set = function(_options, options) {
	if (!options || typeof options != 'object') {
		var options = {};
	}
	for (var key in options) {
		_options[key] = options[key];
	}
	return _options;
};

module.exports.set = set;