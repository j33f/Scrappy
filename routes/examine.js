var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  res.render('examine', {host: req.protocol + '://' + req.get('host'), url: req.param('url'), history: '[]'});
});
router.post('/follow', function(req, res) {
	res.render('examine', {host: req.protocol + '://' + req.get('host'), url: req.param('url'), history: JSON.stringify(req.param('history'))});
});
module.exports = router