var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

var tmpDir = path.join(__dirname, '/../public/tmp');

router.get('/:file', function(req, res) {
	fs.readFile(path.join(tmpDir, req.params.file), function(err, data){
		if (err) throw err;
		var project = JSON.parse(data);
		var params = {
		  	host: req.protocol + '://' + req.get('host') // the current server host, ease the ressources access
		  	, url: project.url // the to be scrapped url
		  	, file: req.param.file // the tmp file name to display into the iframe
		  	, data: JSON.stringify(project.data) // the dataset
		  };

		res.render('format', params);
	})
});

module.exports = router;