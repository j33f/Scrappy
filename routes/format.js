var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

var CSV = require('comma-separated-values');
var archiver = require('archiver');

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
		if (Object.keys(project.data).length == 1) {
			res.type('text/csv');
			res.set('Content-Disposition','attachment; filename="scrap.csv"');
			var csvFile = new CSV(project.data[Object.keys(project.data)[0]], { header: true }).encode();
			res.send(csvFile);
		} else {
			res.type('application/zip');
			res.set('Content-Disposition','attachment; filename="scrap.zip"');

			var archive = archiver('zip'); // create a zip archive
			archive.on('error', function(err) {
				throw err; // omg an error !
			});
			archive.pipe(res); // pipe the archive output to the Express ressponse object
			for (var name in project.data) {
				// for each datastore, create a CSV concent and add it to the zip
				var csvFile = new CSV(project.data[name], { header: true }).encode();
				archive.append(csvFile, {name: name +'.csv'});
			}
			archive.finalize(); // zip it ! (and send it)
		}
	});
});

module.exports = router;