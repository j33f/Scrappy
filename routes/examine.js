var express = require('express');
var router = express.Router();
var scrap = require('scrap');
var slugify = require('slug');
var iconv = require('iconv-lite');
var fs = require('fs');

var tmpDir = __dirname+'/../public/tmp';

var collectGarbage = function() {
  var endTime = new Date().getTime() - 3600000 * 24;
  
	fs.readdir(tmpDir, function(err, files) {
		if (err) {
			return console.error(err);
		}
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

	var storeAndSend = function(html) {
		try {
			// try to create the tmp dir in public
			// ugly thing : fix me
			fs.mkdirSync(tmpDir);
		} catch (e) {/* do nothing */}

		fs.unlink(tmpDir+'/'+tmp, function(){
			// unlink to refresh the ctime
			fs.writeFile(tmpDir+'/'+tmp, html, function() {
				// send the data when the file has been written and available fot http queries
				var params = {
			  	host: req.protocol + '://' + req.get('host')
			  	, url: url
			  	, history: '[]'
			  	, tmp: tmp
			  	, load: "'" +(req.param('load') || '') + "'"
			  };
			  res.render('examine', params);
			});
		});
	}

	scrap(url, function(err, $, code, html, resp) {
		if (err) {
			res.send(500,err);
		} else {
			// try to find the page encoding
			if($('head meta[http-equiv=\'Content-Type\']').length > 0) {
				var charset = $('head meta[http-equiv=\'Content-Type\']').attr('content').match(/charset=(.*)/)[1].toLowerCase();
				scrap({url: url, encoding: null}, function(err, $, code, html, resp) {
					storeAndSend(iconv.decode(html, charset));
				});
			} else if ($('head meta[charset]').length > 0){
				var charset = $('head meta[charset]').attr('charset').toLowerCase();
				scrap({url: url, encoding: null}, function(err, $, code, html, resp) {
					storeAndSend(iconv.decode(html, charset));
				});
			} else {
				// assume its utf-8
				storeAndSend(html);
			}
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