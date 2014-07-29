var express = require('express');
var router = express.Router();
var scrap = require('scrap');
var uuid = require('node-uuid')
var fs = require('fs');

router.post('/', function(req, res) {
	var url = req.param('url');
	scrap(url, function(err, $, code, html, resp) {
		if (err) {
			res.send(500,err);
		} else {
			var tmp =  uuid.v4()+'.html';
			try {
				fs.mkdirSync(__dirname+'/../public/tmp');
			} catch (e) {/* do nothing */}
			fs.writeFile(__dirname+'/../public/tmp/'+tmp, html, function() {
			  res.render('examine', {host: req.protocol + '://' + req.get('host'), url: url, history: '[]', tmp: tmp});
			});
		}
	});
});
router.post('/follow', function(req, res) {
	res.render('examine', {host: req.protocol + '://' + req.get('host'), url: req.param('url'), history: JSON.stringify(req.param('history'))});
});
module.exports = router