var express = require('express');
var router = express.Router();
var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var slugify = require('slug');
var fs = require('fs');
var path = require('path');

var actions = require('./libs/actions');

var tmpDir = path.join(__dirname, '../public/tmp');

var collectGarbage = function() {
	// delete temp files older than 24h
  var endTime = new Date().getTime() - 3600000 * 24;
  
	fs.readdir(tmpDir, function(err, files) {
		if (err) {
			return console.error(err);
		}
	  files.forEach(function(file, index) {
	  	if (file != '.placeholder') {
		    fs.stat(path.join(tmpDir, file), function(err, stat) {
		      if (err) {
		        return console.error(err);
		      }
		      var fileTime = new Date(stat.ctime).getTime();
		      if (fileTime > endTime) {
		        fs.unlink(path.join(tmpDir, file), function(err){if(err)console.log(err)});
		      }
		    });
		  }
	  });
	});	
}

var listActions = function() {
	// list the actions to display them in the UI
	var specials = {};
	var defaults = [];
	for (var action in actions) {
		for (var i in actions[action].tags) {
			var tag = actions[action].tags[i];
			if (tag != '') {
				if (specials[tag] == undefined) {
					specials[tag] = [];
				}
				specials[tag].push({action: action, label: actions[action].label});
			} else {
				defaults.push({action: action, label: actions[action].label});
			}
		}
	}
	return JSON.stringify({specials: specials, defaults: defaults}).replace("'", "\\'");
}

/******************************************************************************/

router.post('/', function(req, res) {
	var url = req.param('url');
	var tmp =  slugify(url)+'.html';

	var storeAndSend = function(html, charset) {
		try {
			// try to create the tmp dir in public
			// ugly thing : fix me
			fs.mkdirSync(tmpDir);
		} catch (e) {/* do nothing */}

		fs.unlink(path.join(tmpDir, tmp), function(){
			// unlink to refresh the file ctime of the page stored for examination in the iframe (the only way to do that)
			fs.writeFile(path.join(tmpDir, tmp), html, function() {
				// render when the tmp file has been written and available fot http queries
				var params = {
			  	host: req.protocol + '://' + req.get('host') // the current server host, ease the ressources access
			  	, url: url // the to be scrapped url
			  	, history: '[]' // the "history" in case of the current page is one of the pages to be scrapped in the project, not in use yet
			  	, tmp: tmp // the tmp file name to display into the iframe
			  	, load: "'" +(req.param('load') || '') + "'" // the project that we want to load from user localStorage
			  	, charset: charset // the to be scrapped page charset
			  	, actions: listActions()
			  };
			  res.render('examine', params);
			});
		});
	};

	/**********************************************************************/
	request({url: url, encoding: null}, function(err, code, html) {
		if (err) {
			res.send(500,err);
		} else {
			var $ = cheerio.load(html);
			// try to find the page encoding via http-equiv tag and via meta tag
			if($('head meta[http-equiv=\'Content-Type\']').length > 0) {
				var charset = $('head meta[http-equiv=\'Content-Type\']').attr('content').match(/charset=(.*)/)[1].toLowerCase();
				storeAndSend(iconv.decode(html, charset), charset);
			} else if ($('head meta[charset]').length > 0){
				var charset = $('head meta[charset]').attr('charset').toLowerCase();
				storeAndSend(iconv.decode(html, charset), charset);
			} else {
				// assume its utf-8
				storeAndSend(html, 'utf-8');
			}
		}
	});

	collectGarbage();
});

/*router.post('/follow', function(req, res) {
	res.render('examine', {
		host: req.protocol + '://' + req.get('host')
		, url: req.param('url')
		, history: JSON.stringify(req.param('history'))
	});
});*/
module.exports = router;