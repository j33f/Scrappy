var set = function(defOptions, options) {
	// set the user options to the default ones
	// defOptions are the default ones
	if (!options || typeof options != 'object') {
		var options = {};
	}
	var _options = JSON.parse(JSON.stringify(defOptions)); // clone the defOptions to avoid mess
	for (var key in options) {
		_options[key] = options[key];
	}
	return _options;
};

module.exports.set = set;