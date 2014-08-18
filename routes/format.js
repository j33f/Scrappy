var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

var zip = new require('node-zip')();

var tmpDir = path.join(__dirname, '/../public/tmp');

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

Object.values = function(obj) {
	var ret = [];
	Object.keys(obj).map(function() {
		for (var i in this) {
			ret.push(this[i]);
		}
	});
	return ret;
}

router.get('/:file', function(req, res) {
	var params = {
	  	host: req.protocol + '://' + req.get('host') // the current server host, ease the ressources access
	  	, file: req.params.file // the collected data file
	};

	res.render('format', params);
});

router.get('/:file/json', function(req, res){
	fs.readFile(path.join(tmpDir, req.params.file+'.json'), function(err, content) {
		if (err) throw err;
		var project = JSON.parse(content);
		res.set('Content-Disposition','attachment; filename="scrap.json"');
		res.json(project.data);
	});
});

router.get('/:file/csv', function(req, res) {
	fs.readFile(path.join(tmpDir, req.params.file+'.json'), function(err, content) {
		if (err) throw err;
		var project = JSON.parse(content);
		var data = project.data;
		var files = {};
		for (var name in data) {
			files[name] = [];
			if (toType(project.data[name][0][0]) == 'object') {
				var type = 'object';
				files[name].push(Object.keys(project.data[name][0][0]).join(','));
			} else {
				var type = 'array';
			}
			for (var i in project.data[name]) {
				for (var j in project.data[name][i]) {
					if (type == 'object')  {
						files[name].push(Object.values(project.data[name][i][j]).join(','));
					} else {
						files[name].push(project.data[name][i][j].join(','));
					}
				}
			}
		}
		if (Object.keys(files).length == 1) {
			res.type('text/csv');
			res.set('Content-Disposition','attachment; filename="scrap.csv"');
			res.send(files[name].join('\n'));
		} else {
			for (var name in files) {
				zip.file(name +'.csv', files[name].join('\n'));
			}
			var zipFile = zip.generate({compression:'DEFLATE'});
			res.type('application/x-zip');
			res.set('Content-Disposition','attachment; filename="scrap.zip"');
			res.send(new Buffer(zipFile));
		}
	});
});

module.exports = router;