var express = require('express');
var router = express.Router();
var scrap = require('scrap');
var slugify = require('slug');
var fs = require('fs');

var tmpDir = __dirname+'/../public/tmp';

var collectGarbage = function() {
  var endTime = new Date().getTime() - 3600000 * 24;
  
	fs.readdir(tmpDir, function(err, files) {
	  files.forEach(function(file, index) {
	    fs.stat(tmpDir+'/'+file, function(err, stat) {
	      if (err) {
	        return console.error(err);
	      }
	      var fileTime = new Date(stat.ctime).getTime();
	      if (fileTime > endTime) {
	        fs.unlink(tmpDir+'/'+file, function(err){if(err)console.log(err)});
	      }
	    });
	  });
	});	
}

/******************************************************************************/

router.post('/', function(req, res) {
	var url = req.param('url');
	var tmp =  slugify(url)+'.html';
	scrap(url, function(err, $, code, html, resp) {
		if (err) {
			res.send(500,err);
		} else {
			try {
				// try to create the tmp dir in public
				// ugly thing : fix me
				fs.mkdirSync(tmpDir);
			} catch (e) {/* do nothing */}

			fs.unlink(tmpDir+'/'+tmp, function(){
				// unlink to refresh the ctime
				fs.writeFile(tmpDir+'/'+tmp, html, function() {
					// send the date when the file has been written and available fot http queries
				  res.render('examine', {
				  	host: req.protocol + '://' + req.get('host')
				  	, url: url
				  	, history: '[]'
				  	, tmp: tmp
				  });
				});
			});
		}
	});
	collectGarbage();
});
router.post('/follow', function(req, res) {
	res.render('examine', {
		host: req.protocol + '://' + req.get('host')
		, url: req.param('url')
		, history: JSON.stringify(req.param('history'))
	});
});
module.exports = router