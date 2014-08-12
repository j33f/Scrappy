var express = require('express');
var router = express.Router();
var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var urls = require('url');
var async = require('async').actions;

var actions = require('./libs/actions');

/******************************************************************************/

router.post('/', function(req, res) {
  var project = JSON.parse(req.param('project')); // load the scrapping project
  project.data = {}; // the data scrapped from url
  project.pagination = {urls:[project.url], selectors:[], scrapped: 0}; // the pagination links if any
  																													 // {urls: [array of urls to scrap, the first one is the project url], selectors: [array of links selectors], scrapped: number of pagination urls scrapped}
	var doScrap = function() {
		// scrap the pages to scrap
		console.log('> Scrapping url '+(project.pagination.scrapped +1 )+'/'+project.pagination.urls.length);
		var url = project.pagination.urls[project.pagination.scrapped]; // use the current url in list

	  request({url: url, encoding: null}, function(err, code, html) {
	  	html = iconv.decode(html, project.charset); // apply the proper charset to the html content : is it really useful ?
	  	for (var name in project.actions) {
	  		// perform all actions and store them into the datastore
	  		if (actions[project.actions[name].action]) { // ensure that the action really exists
	  			project.data[name] = actions[project.actions[name].action](html, project.actions[name].selector); // perform the action
	  			// Duplicates
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
		  				// TODO : take advantage or the base url meta !
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
	  		console.log('> Done.');
	  		res.json(project.pagination); // Output the data 'as is' by now for dev
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
  doScrap(); // this function outputs the result
});

module.exports = router