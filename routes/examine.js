var express = require('express');
var router = express.Router();
var scrap = require('scrap');
var slugify = require('slugify');
var fs = require('fs');

var tmpDir = __dirname+'/../public/tmp';

var collectGarbage = function() {

	fs.readdir(tmpDir, function(err, files) {
	  files.forEach(function(file, index) {
	    fs.stat(tmpDir+'/'+file, function(err, stat) {
	      var endTime, now;
	      if (err) {
	        return console.error(err);
	      }
	      now = new Date().getTime();
	      endTime = new Date(stat.ctime).getTime() + 3600000 + 24;
	      if (now > endTime) {
	        fs.rmdir(tmpDir+'/'+file, function(){});
	      }
	    });
	  });
	});	
}

router.post('/', function(req, res) {
	var url = req.param('url');
	scrap(url, function(err, $, code, html, resp) {
		if (err) {
			res.send(500,err);
		} else {
			var tmp =  slugify(url)+'.html';
			try {
				fs.mkdirSync(tmpDir);
			} catch (e) {/* do nothing */}
			fs.unlink(tmpDir+'/'+tmp, function(){
				fs.writeFile(tmpDir+'/'+tmp, html, function() {
				  res.render('examine', {host: req.protocol + '://' + req.get('host'), url: url, history: '[]', tmp: tmp});
				});
			});
		}
	});
	collectGarbage();
});
router.post('/follow', function(req, res) {
	res.render('examine', {host: req.protocol + '://' + req.get('host'), url: req.param('url'), history: JSON.stringify(req.param('history'))});
});
module.exports = router