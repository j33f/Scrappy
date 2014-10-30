var express = require('express');
var router = express.Router();
var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var urls = require('url');
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');
var optionsUtils = require('./libs/options');
var deepEqual = require('deep-equal');
var isDuplicate = function(needle,haystack,opts) {
  for (var i in haystack) {
    if (deepEqual(needle, haystack[i])) {
      return true;
    }
  }
  return false;
}

var actions = require('./libs/actions');

var tmpDir = path.join(__dirname, '../public/tmp');

/******************************************************************************/

var scrap = function(socket, json, res) {
  var project = JSON.parse(json); // load the scrapping project
  project.data = {}; // the data scrapped from url
  project.pagination = {urls:[project.url], selectors:[], scrapped: 0}; // the pagination links if any
  																													 // {urls: [array of urls to scrap, the first one is the project url], selectors: [array of links selectors], scrapped: number of pagination urls scrapped}
	var defaultOptions =  { 
    skipOrigin: true,
    skipLast: true,
    limitPagination: false,
    limitPaginationTo: 0,
    avoidDuplicates: false
  };
  project.options.limitPaginationTo = parseInt(project.options.limitPaginationTo);
  project.options = optionsUtils.set(defaultOptions, project.options);

  var doScrap = function() {
  	// scrap the pages to scrap
  	if (socket !== null) socket.emit('progress', JSON.stringify({current:(project.pagination.scrapped +1), total: project.pagination.urls.length}));
  	console.log('> url ' + (project.pagination.scrapped +1) + '/' + project.pagination.urls.length + ' - ' + project.pagination.urls[project.pagination.scrapped]);

  	var url = project.pagination.urls[project.pagination.scrapped]; // use the current url in list

    request({url: url, encoding: null}, function(err, code, html) {
    	html = iconv.decode(html, project.charset); // apply the proper charset to the html content : is it really useful ?
      if (
        ( project.options.skipOrigin && project.pagination.selectors.length > 0 && project.pagination.urls.length > 1 )
        || 
        !project.options.skipOrigin
      ) {
      	for (var name in project.actions) {
      		// perform all actions and store them into the datastore
      		if (actions[project.actions[name].action]) { // ensure that the action really exists
      			if (project.data[name] == undefined) { project.data[name] = []; } // create the datastore if needed
      			var actionResult = actions[project.actions[name].action].do(html, project.actions[name].selector, url); // perform the action and collect data
      			project.data[name] = project.data[name].concat(actionResult); // add the collected data to the datastore
      		}
      	}
      } else {
        console.log('Origin skipped');
      }
    	// collects all pagination links hrefs
      if (project.options.limitPagination && project.options.limitPaginationTo > 0 && project.pagination.urls.length < project.options.limitPaginationTo) {
        // we did not have reached the limit yet
      	var $ = cheerio.load(html);
      	for (var i in project.pagination.selectors) {
      		$(project.pagination.selectors[i]).each(function(index) {
            if ( 
              ( project.options.skipLast && index < $(project.pagination.selectors[i]).length-1 )
              ||
              !project.options.skipLast
            ) {
        			// get the href of all pagination links
        			var href = $(this).attr('href');
        			if (href) {
        				// some time the anchors are just anchors !
      	  			if (href.trim() != '') {
      	  				// sometime hrefs are invalids or relatives : reconstruct an absolute url
      	  				// TODO : take advantage of the base url meta !
      	  				var url = urls.parse(href, true);
      	  				if (!url.hostname) {
      	  					href = urls.resolve(project.url, href);
      	  				}
      	  				if (project.pagination.urls.indexOf(href) == -1) {
      	  					// we can add this url if we did not already have it
                    if (project.options.limitPagination && project.options.limitPaginationTo > 0 && project.pagination.urls.length < project.options.limitPaginationTo) {
                      // we did not have reached the limit yet
      	  					  project.pagination.urls.push(href);
                    } else {
                      console.log('pagination limit reached');
                    }
      	  				}
      	  			}
      	  		}
            }
      		});
      	}
      } else {
        console.log('pagination limit reached');
      }

    	project.pagination.scrapped++; // increment the scrapped urls counter
    	
    	if (project.pagination.urls.length > project.pagination.scrapped) {
    		// we do have some more urls to scrap
    		doScrap();
    	} else {
        // need to delete duplicates ?
        if (project.options.avoidDuplicates) {
          var total = 0;
          for (var i in project.data) {
            total += project.data[i].length;
          }
          var data = {};
          var duplicates = 0;
          var current = 0;
          var lastSocketEmit = 0;
          for (var i in project.data) {
            data[i] = [];
            for (var j in project.data[i]) {
              current++;
              if (!isDuplicate(project.data[i][j], data[i])) {
                data[i].push(project.data[i][j]);
              } else {
                duplicates++;
              }
            }
          }
          if (socket !== null) socket.emit('unduplicate done', JSON.stringify({total: total, duplicates: duplicates}));
          project.data = data;
        }

    		// process is done
    		if (socket !== null) socket.emit('scrap done');

    		// save the project object to a file
    		var fileId = uuid.v4();
    		var fileName = fileId + '.json';
    		var file = path.join(tmpDir,fileName);
        console.log('Writing project to '+file);
    		fs.writeFile(file, JSON.stringify(project, null, '\t'), function(){
    			if (socket !== null) socket.emit('done', fileId);
    			if (res) res.redirect('/tmp/' + fileId);
    		});
    	}
  	});
  }; // end doScrap();


	if (socket !== null) socket.emit('start');

  // look for pagination links to follow
  for (var name in project.actions) {
  	if (project.actions[name].action == 'pagination') {
  		// we have a pagination rule : store it and delete it from the common actions to perform 
  		project.pagination.selectors.push(project.actions[name].selector);
  		delete project.actions[name];
  	}
  }

  // let's do the scrap things
  doScrap();

};

router.post('/', function(req, res){
	scrap(null, req.param('project'), res);
});

module.exports.scrap = scrap;
module.exports.router = router;