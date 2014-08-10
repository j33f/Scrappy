var set = function(_options, options) {
	// set the user options to the devault ones
	// _options are the default ones
	if (!options || typeof options != 'object') {
		var options = {};
	}
	for (var key in options) {
		_options[key] = options[key];
	}
	return _options;
};

module.exports.set = set;