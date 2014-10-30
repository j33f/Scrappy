var $page;
var defaultOptions = { // default Scrappy options
	skipOrigin: true
	, skipLast: true
	, limitPagination: false
	, limitPaginationTo: 0
	, avoidDuplicates: false
};
var options = {}; // current options, will be initialized later in the script
var actions = {};

var sio = io.connect(host); // initiate the socket

var cleanup = function(selector) {
	// cleanup a selector by removing parents that have no id attribute but the last one in selector
	var s = selector.split(' ');
	var newS = [];
	s.reverse();
	for (var i in s) {
		if (s[i].indexOf('#') == -1) {
			newS.push(s[i]);
		} else {
			newS.push(s[i]);
			break;
		}
	}
	return newS.reverse().join(' ');
}

var setOptions = function(defOptions, options) {
	// set the user options to the default ones
	// _options are the default ones
	if (!options || typeof options != 'object') {
		var options = {};
	}
	var _options = JSON.parse(JSON.stringify(defOptions));
	for (var key in options) {
		_options[key] = options[key];
	}
	return _options;
};

$(function(){
	(function(old) {
	  // allow to list all attributes by calling $(element).attr()
	  $.fn.attr = function() {
	  	if(arguments.length === 0) {
	  		if(this.length === 0) {
	  			return null;
	  		}

	  		var obj = {};
	  		$.each(this[0].attributes, function() {
	  			if(this.specified) {
	  				obj[this.name] = this.value;
	  			}
	  		});
	  		return obj;
	  	}

	  	return old.apply(this, arguments);
	  };
	})($.fn.attr);

	$.fn.getSelector = function() {
		var parents = [];
		var selector = '';
		$(this).first().parents()
			.each(function(index,element) { 
				var tag = $(element)[0].nodeName.toLowerCase();
				var id = $(element).attr('id');
				var classNames = $(element).attr('class');
				if (id) {
					parents.push('#'+id);
				} else if (classNames) {
					parents.push(tag + '.' + $.trim(classNames).replace(/\s/gi, '.'));
				} 
			});
		if (parents.length > 0) {
			selector = parents.reverse().join(' ');
		}
		if (selector) { 
			selector += " "+ $(this)[0].nodeName.toLowerCase();
		}

		var id = $(this).attr("id");
		if (id) { 
			selector += "#"+ id;
		}

		var classNames = $(this).attr("class");
		if (classNames) {
			selector += "." + $.trim(classNames).replace(/\s/gi, ".");
		}
		return selector;
	};

	var countTags = function(tag, $el) {
		var c = 0;
		for (var i = 0 in $el) {
			if ($el[i].nodeName) {
				if ($el[i].nodeName.toLowerCase() == tag) c++;
			} else {
				return c;
			}
		}
		return c;
	};

	var drawActionsTable = function() {
		var actionsHtml = '';
		for (var i in actions) {
			var thisAction = actions[i];
			actionsHtml += 			
			'<tr>'
			+ '<td>' + thisAction.niceName + '</td>'
			+ '<td>' + thisAction.selector + '</td>'
			+ '<td>' + thisAction.action + '</td> '
			+ '<td>' + (thisAction.attr.join(', ') || 'none') + '</td>'
			+ '<td>'
			+ '<button type="button" class="btn btn-danger btn-sm remove" data-action="' + i + '"><strong class="glyphicon glyphicon-trash"></strong></button>'
			+ '</td>'
			+ '</tr>'
			;
		}
		$('#actions-list').html(actionsHtml);
		$('#actionscount').html(Object.keys(actions).length);
	};

	var gotLocalStorage = function() {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	};

	var saveProject = function(name, action) {
		if (action == 'create') {
			if (!localStorage.scrappyActions) localStorage['scrappyActions'] =  JSON.stringify({});
		}
		var ls = JSON.parse(localStorage.scrappyActions);
		if (action == 'create') {
			if (ls[name]) {
				bootbox.prompt('A project with this name already exists, please choose another name', function(name){
					saveProject(name, 'create');
				});
				return false;
			}
		}
		ls[name] = {
			url: url
			, charset: charset
			, actions: actions
			, options: options
			, history: history
		};
		localStorage['scrappyActions'] = JSON.stringify(ls);
		$('#project').show().find('strong').html(name);
		$('.savechanges').show();
		if (action == 'create') {
			bootbox.alert('Created !');
		} else {
			bootbox.alert('Changes saved !');
		}

	}

	// options UI
	$('.btn-toggle.radio').click(function() {
		$(this).find('.btn').toggleClass('active');
	});
	$('.btn.reset').click(function(){
		options = JSON.parse(JSON.stringify(defaultOptions));
		setOptionsUI(options);
		$('#doscrap').data('projectjson', JSON.stringify({
			url: url
			, charset: charset
			, actions: actions
			, history: history
			, options: options
		}));
	});

	var setOptionsUI = function(opts) {
		for (var i in opts) {
			if (i == 'limitPaginationTo') {
				$('#limitPaginationTo').val(opts.limitPaginationTo);
			} else if (opts[i]) {
				$('#' + i + ' .on input').attr('checked',true);
				$('#' + i + ' .off input').attr('checked',false);
				$('#' + i + ' .on').addClass('active');
				$('#' + i + ' .off').removeClass('active');
				if ($('#' + i).hasClass('toggleform')) {
					$('#' + $('#' + i).data('target')).collapse('show');      
				}					
			} else {
				$('#' + i + ' .on input').attr('checked',false);
				$('#' + i + ' .off input').attr('checked',true);					
				$('#' + i + ' .on').removeClass('active');
				$('#' + i + ' .off').addClass('active');
				if ($('#' + i).hasClass('toggleform')) {
					$('#' + $('#' + i).data('target')).collapse('hide');      
				}					
			}
		}
	}

	/***********************************************************************/
	var pageOffset = $('#page').offset();

	$page = $('#page').contents(); // $page is the iframe content

	window.setTimeout(function(){
		$page.ready(function(){
			// add some styles to the frame
			$page.find('head').append('<style>body * {cursor: crosshair!important;} .scrappy_selected_element{border: 2px solid red!important}</style>');
			// when clicking on any element on iframe, unmark all eventually previously marked element, mark it as selected (via a class) and get its selector
			$('html body *', $page)
				.click(function(evt) {
					evt.preventDefault();
					$page.find('.scrappy_selected_element').removeClass('scrappy_selected_element');
					
					var selector = $(this).getSelector();

					if ($('#cleanup').is(':checked')) {
						// cleanup the selector field if the cleanup checkbox is checked
						$('#current-selector').val(cleanup(selector));
					} else {
						$('#current-selector').val(selector);
					}

					// hilight the selector input field to make the action visible
					$('#current-selector')
						.keyup()
						.effect('highlight', {}, 2000)
					;
					return false;
				});
		});
		$('#loading').hide();
		$('#page').height($(window).height() - pageOffset.top - $('#main-form').height() - $('#tabnav').height());
	}, 1000);

	$('#current-selector').keyup(function() {
		// check the current selector string, visually mark them then count them
		var selector = $(this).val();
		$page.find('.scrappy_selected_element').removeClass('scrappy_selected_element');
		try {
			var $elements = $page.find(selector);
		} catch (e) {
			var $elements = $();
		}
		$elements.addClass('scrappy_selected_element');
		var count = $elements.length;
		if (count > 0) {
			var indication = count+' element';
			if (count > 1) indication +='s';
			indication = '<span class="alert alert-success">' + indication + ' found</span>';
		} else {
			var indication = '<span class="alert alert-danger"><strong>Not found !</strong></span>';
		}
		$('#indicator').html(indication);
	});


	$('#cleanup').click(function(){
		var selector = $('#current-selector').val();
		var $page = $('#page').contents();

		$page.find('.scrappy_selected_element').removeClass('scrappy_selected_element');

		selector = $(selector, $page).getSelector();

		if ($(this).is(':checked')) {
			// cleanup the selector field if the cleanup checkbox is checked
			$('#current-selector').val(cleanup(selector));
		} else {
			$('#current-selector').val(selector);
		}
		$('#current-selector').keyup();
	});

	$('#add').click(function(){
		var selector = $('#current-selector').val();
		$('#selector-info').html(selector);

		$('#nicename').val('');

		var $elements = $('#page').contents().find(selector);
		var tags = [];

		$elements.each(function(index, el){
			var tag = $(el)[0].nodeName.toLowerCase();
			if ($.inArray(tag, tags) == -1) tags.push(tag);
		})

		var count = $elements.length;
		var $action = $('#action');
		var $attributes = $('#attributes');

		$action.html('<option value="" selected="selected" disabled="disabled">Please choose one</option>');
		$attributes.html('');
		// construct the select element to choose the proper actions to display
		var specialTagFound = false;
		for (var element in actionsList.specials) {
			if ($.inArray(element, tags) >= 0) {
				specialTagFound = true;
				for (var i in actionsList.specials[element]) {
					$action.append('<option value="' + actionsList.specials[element][i].action + '">' + actionsList.specials[element][i].label + '</option>');
				}
			}
		}
		if (!specialTagFound) {
			for (var i in actionsList.defaults) {
				$action.append('<option value="' + actionsList.defaults[i].action + '">' + actionsList.defaults[i].label + '</option>');
			}
		}
		if (tags.length == 1) {
			var attr = $elements.first().attr();
			if (Object.keys(attr).length > 0) {
				for (var k in attr) {
					$attributes.append('<option value="'+k+'">' + k + '</option>');
				}
				$('#attributes-div').show();
			} else {
				$('#attributes-div').hide();
			}
		}

		$('#add-action-modal').modal();
	});

	$('#btn-add-action-modal').click(function(){
		var thisAction = {
			niceName: $('#nicename').val().trim()
			, selector: $('#current-selector').val().trim()
			, action: ($('#action').val() || 'get attributes')
			, attr: ($('#attributes').val() || [])
		};

		if (thisAction.niceName == '') {
			bootbox.alert('Please give a nice name!');
		} else if (actions[thisAction.niceName]) {
			bootbox.alert('This name is already in use !');
		} else if ((thisAction.action == 'get attributes') && thisAction.attr.length == 0) {
			bootbox.alert('You must select an action to perform with this selector and / or some attributes to grab.');
		} else {
			actions[thisAction.niceName] = thisAction;
			drawActionsTable();
			$('#doscrap').data('projectjson', JSON.stringify({
				url: url
				, charset: charset
				, actions: actions
				, history: history
				, options: options
			}));
			$('#actions-list').find('.popover-dismiss').popover();

			$('#add-action-modal').modal('hide');
			
			var highlight = ['#selectorslisttab'];
			if ($('#nextstepstab').css('display') == 'none') highlight.push('#nextstepstab');
			$(highlight.join(',')).show().effect('highlight', {}, 2000);
		}
	});

	$('#actions-list').on('click', '.remove', function() {
		delete actions[$(this).data('action')];
		$('#doscrap').data('projectjson', JSON.stringify(actions));
		if (Object.keys(actions).length > 0) {
			$(this).parents('tr').hide(200, function(){
				$('#actionscount').html(Object.keys(actions).length);
				$(this).remove();
			});
		} else {
			$('#examinetab a').tab('show');
			$('#selectorslisttab, #nextstepstab').hide(200);
		}
	});	

	// getting options
	$('.btn-toggle.radio input[type="radio"]').change(function() {
		var $parent = $(this).parents('.btn-toggle.radio');
		var opt = $parent.data('option');
		options[opt] = $parent.find('.on input').prop('checked');
		if ($parent.hasClass('toggleform')) {
			if (options[opt]) {
				$('#' + $parent.data('target')).collapse('show');      
			} else {
				$('#' + $parent.data('target')).collapse('hide');      
			}
		}

		$('#doscrap').data('projectjson', JSON.stringify({
			url: url
			, charset: charset
			, actions: actions
			, history: history
			, options: options
		}));
		console.log(options);
	});
	$('#projectOptions input').on('keyup, change, click', function(){
		options[$(this).data('option')] = $(this).val();
		$('#doscrap').data('projectjson', JSON.stringify({
			url: url
			, charset: charset
			, actions: actions
			, history: history
			, options: options
		}));	
		console.log(options);
	});

	$('#saveproject').click(function(){
		if (!gotLocalStorage()) {
			bootbox.alert('Your current browser seems to be a beautiful piece of holly crap, please, consider <a href="http://browsehappy.com/">downloading an up to date one</a>.');
			return false;
		}
		bootbox.prompt('Give a name to this project', function(name){
			saveProject(name, 'create');
		});
	});

	$('#savechanges').click(function(){
			saveProject(load, 'save');
	});

	// load  project if any
	if (load != '') {
		var ls = JSON.parse(localStorage.scrappyActions);
		var project = ls[load];
		actions = project.actions;
		history = project.history;
		options = defaultOptions
		drawActionsTable();
		setOptionsUI(project.options);
 		$('#doscrap').data('projectjson', JSON.stringify({
				url: url
				, charset: charset
				, actions: actions
				, history: history
				, options: options
			}));
		$('#selectorslisttab, #nextstepstab, #optionstab').show().effect('highlight', {}, 2000);
		$('#project').show().find('strong').html(load);
 		$('.savechanges').show();
	} else {
		// set default options
		options = setOptions(defaultOptions, {});
	}

	$('#doscrap').click(function(e) {
		sio.emit('scrap', $(this).data('projectjson'));
		$('#scrap-modal').modal({
			backdrop: 'static'
			, keyboard: false
		});
	});
	var $scrapProgressBar = $('#scrap-modal .progress-bar');
	var $scrapProgressLabel = $('#scrap-modal .progressLabel');
	var $scrapProgressTitle = $('#scrap-modal .modal-title');
	var $scrapProgressMessage = $('#scrap-modal .message');
	sio
		.on('start', function(){
			console.log('> Start');
			$scrapProgressMessage.html('Starting...');
		})
		.on('progress', function(message){
			var json = JSON.parse(message);
			$scrapProgressMessage.html('Scraping page '+ json.current + '/' + json.total);
			$scrapProgressBar
				.attr('aria-valuenow', json.current)
				.attr('aria-valuemax', json.total)
				.css('width', (json.current / json.total * 100)+'%')
			;
			console.log(json);
		})
		.on('scrap done', function() {
			$scrapProgressMessage.html('Scrapping done... Saving...');
			$('#scrap-modal .progress-bar').addClass('progress-bar-info');			
		})
		.on('unduplicate', function(message){
			var json = JSON.parse(message);
			$scrapProgressTitle.html('Removing duplicates');
			$scrapProgressMessage.html('This stage can take several minutes with huge datasets');
		})
		.on('unduplicate done', function(message){
			var json = JSON.parse(message);
			$scrapProgressTitle.html('Removing duplicates');
			$scrapProgressMessage.html('Done ! ' + json.total + 'entries checked, ' + json.duplicates + 'were found and deleted.');
		})
		.on('done', function(file){
			$scrapProgressMessage.html('All done ! Redirecting to the next step...');
			document.location = host + '/data/' + file;
			$('#scrap-modal .progress-bar').removeClass('active progress-bar-info').addClass('progress-bar-success');			
		})
	;

/*
	$('#follow').submit(function(e){
		var firstUrl = $('.sample a').attr('href');
		$(this).find('input[name="url"]').val(firstUrl);
		var hist = {
			url: url
			, actions: []
		};
		$('#actions-list li').each(function(index){
			hist.actions.push({selector: $(this).find('input[type="text"]').val(), action: $(this).find('select').val()});
		});
		history.push(hist);
		$(this).find('input[name="history"]').val(JSON.stringify(history));
	})
*/

});