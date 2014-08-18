var express = require('express');
var router = express.Router();
var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var urls = require('url');
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');

var actions = require('./libs/actions');

var tmpDir = path.join(__dirname, '../public/tmp');

/******************************************************************************/

var scrap = function(socket, json, res) {
  var project = JSON.parse(json); // load the scrapping project
  project.data = {}; // the data scrapped from url
  project.pagination = {urls:[project.url], selectors:[], scrapped: 0}; // the pagination links if any
  																													 // {urls: [array of urls to scrap, the first one is the project url], selectors: [array of links selectors], scrapped: number of pagination urls scrapped}
	if (socket !== null) socket.emit('start');

	var doScrap = function() {
		// scrap the pages to scrap
		if (socket !== null) socket.emit('progress', JSON.stringify({current:(project.pagination.scrapped +1), total: project.pagination.urls.length}));
		console.log('> url ' + (project.pagination.scrapped +1) + '/' + project.pagination.urls.length);

		var url = project.pagination.urls[project.pagination.scrapped]; // use the current url in list

	  request({url: url, encoding: null}, function(err, code, html) {
	  	html = iconv.decode(html, project.charset); // apply the proper charset to the html content : is it really useful ?
	  	for (var name in project.actions) {
	  		// perform all actions and store them into the datastore
	  		if (actions[project.actions[name].action]) { // ensure that the action really exists
	  			if (!project.data[name]) { project.data[name] = []; } // create the datastore if needed
	  			var actionResult = actions[project.actions[name].action](html, project.actions[name].selector); // perform the action and collect data
	  			project.data[name].concat(actionResult); // add the collected data to the datastore
	  		}
	  	}
	  	// collects all pagination links hrefs
	  	var $ = cheerio.load(html);
	  	for (var i in project.pagination.selectors) {
	  		$(project.pagination.selectors[i]).each(function() {
	  			// get the href of all pagination links
	  			var href = $(this).attr('href');
	  			if (href) {
	  				// some time the anchors are just anchor !
		  			if (href.trim() != '') {
		  				// sometime hrefs are invalids or relatives : reconstruct an absolute url
		  				// TODO : take advantage of the base url meta !
		  				var url = urls.parse(href, true);
		  				if (!url.hostname) {
		  					href = urls.resolve(project.url, href);
		  				}
		  				if (project.pagination.urls.indexOf(href) == -1) {
		  					// we can add this url if we did not already have it
		  					project.pagination.urls.push(href);
		  				}
		  			}
		  		}
	  		});
	  	}

	  	project.pagination.scrapped++; // increment the scrapped urls counter
	  	
	  	if (project.pagination.urls.length > project.pagination.scrapped) {
	  		// we do have some more urls to scrap
	  		doScrap();
	  	} else {
	  		// process is done
	  		if (socket !== null) socket.emit('scrap done');
	  		// save the project object to a file
	  		var fileId = uuid.v4();
	  		var fileName = fileId + '.json';
	  		var file = path.join(tmpDir,fileName);
	  		fs.writeFile(file, JSON.stringify(project, null, '\t'), function(){
	  			if (socket !== null) socket.emit('done', fileId);
	  			if (res) res.redirect('/tmp/' + fileId);
	  		});
	  	}
		});
	}

  // look for pagination links to follow
  for (var name in project.actions) {
  	if (project.actions[name].action == 'follow and repeat') {
  		// we have a pagination rule : store it and delete it from the common actions to perform 
  		project.pagination.selectors.push(project.actions[name].selector);
  		delete project.actions[name];
  	}
  }

  // lest do the scrap things
  doScrap();
};

router.post('/', function(req, res){
	scrap(null, req.param('project'), res);
});

module.exports.scrap = scrap;
module.exports.router = router;