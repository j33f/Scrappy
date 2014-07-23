var express = require('express');
var router = express.Router();
var scrap = require('scrap');

router.post('/check', function(req, res) {
  var url = req.param('url');
  var selector = req.param('selector');
	scrap(url, function(err, $) {
		if (err) {
			res.send({count: 0, error: err});
		} else {
			var $selector = $(selector);
			var count = $selector.length;
			res.send({count: count, sample: $.html($selector.first())});
		}
	});
});

module.exports = router