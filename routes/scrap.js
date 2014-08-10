var express = require('express');
var router = express.Router();
var request = require('request');
var iconv = require('iconv-lite');
var async = require('async').actions;

var actions = require('./libs/actions');

/******************************************************************************/

router.post('/', function(req, res) {
  var project = JSON.parse(req.param('project')); // load the scrapping project
  project.data = {}; // the data scrapped from url
  project.pagination = {links:[], selectors:[]}; // the pagination links if any

  // look for pagination links to follow
  for (var name in project.actions) {
  	if (project.actions[name].action == 'follow and repeat') {
  		// we have a pagination rule : store it and delete it from the common actions to perform 
  		project.pagination.selectors.push(project.actions[name].selector);
  		delete project.actions[name];
  	}
  }
  // scrap the url
  request({url: project.url, encoding: null}, function(err, code, html) {
  	html = iconv.decode(html, project.charset);
	for (var name in project.actions) {
		// perform all actions and store them into the datastore
		project.data[name] = actions[project.actions[name].action](html, project.actions[name].selector);
	}
	res.json(project.data);
  });
});

module.exports = router