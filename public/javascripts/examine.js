var $page;

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

var actions = {};

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
	}

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
	}

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
		$('#page').height($(window).height() - pageOffset.top - $('#main-form').height());
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

		var specialTagFound = false;

		if ($.inArray('a', tags) >= 0) {
			specialTagFound = true;
			var acount = countTags('a', $elements);
			if (acount == 1) {
				$action.append('<option value="follow and repeat">Follow the link and repeat other actions</option>');
				$action.append('<option value="follow and apply new">Follow the link and apply new actions</option>');
			} else {
				$action.append('<option value="follow and repeat">Follow the links and repeat other actions (pagination)</option>');
				$action.append('<option value="follow and apply new">Follow the links and apply new actions</option>');
			}
			$action.append('<option value="get href">Get the url</option>');
			$action.append('<option value="get link text">Get the link text</option>');
		}
		if ($.inArray('img', tags) >= 0) {
			specialTagFound = true;
			$action.append('<option value="get src">Get the image(s) address</option>');
			$action.append('<option value="get data url">Get the image(s) data URI</option>');
		}
		if ($.inArray('p', tags) >= 0) {
			specialTagFound = true;
			var pcount = countTags('p', $elements);
			if (pcount > 1) {
				$action.append('<option value="get html">Get each paragraph HTML content separately</option>');
				$action.append('<option value="get text">Get each paragraph content separately (strip tags)</option>');
				$action.append('<option value="get concatenated html">Get each paragraph HTML content and concat them</option>');
				$action.append('<option value="get concatenated text">Get each paragraph content separately and concat them (strip tags)</option>');
			} else {
				$action.append('<option value="get html">Get the paragraph HTML content</option>');
				$action.append('<option value="get text">Get the paragraph content (strip tags)</option>');				
			}
		}
		if ($.inArray('table', tags) >= 0) {
			specialTagFound = true;
			var pcount = countTags('table', $elements);
			if (pcount > 1) {
				$action.append('<option value="tables to arrays of html">Store each table as an array of html strings (strip headers if any)</option>');
				$action.append('<option value="tables to arrays of html with headers">Store each table as an array of html strings (use headers if any)</option>');
				$action.append('<option value="tables to arrays of html with first row as headers">Store each table as an array of html strings (use the first row as headers)</option>');
				
				$action.append('<option value="tables to arrays of text">Store each table as an array of text strings (strip headers if any - html stripped)</option>');
				$action.append('<option value="tables to arrays of text with headers">Store each table as an array of text strings (use headers if any - html stripped)</option>');
				$action.append('<option value="tables to arrays of text with first row as headers">Store each table as an array of text strings (use the first row as headers - html stripped)</option>');
				
				$action.append('<option value="concatenate tables to array of html">Concatenate each table as an array of html strings (strip headers if any)</option>');
				$action.append('<option value="concatenate tables to array of html with headers">Concatenate each table as an array of html strings (use the fist table headers if any)</option>');
				$action.append('<option value="concatenate tables to array of html with first row as headers">Concatenate each table as an array of html strings (use the first row of the first table as headers)</option>');
				
				$action.append('<option value="concatenate tables to array of text">Concatenate each table as an array of text strings (strip headers if any - html stripped)</option>');
				$action.append('<option value="concatenate tables to array of text with headers">Concatenate each table as an array of text strings (use the fist table headers if any - html stripped)</option>');
				$action.append('<option value="concatenate tables to array of text with first row as headers">Concatenate each table as an array of text strings (use the first row of the first table as headers - html stripped)</option>');
			} else {
				$action.append('<option value="tables to arrays of html">Store the table as an array of html strings (strip headers if any)</option>');
				$action.append('<option value="tables to arrays of html with headers">Store table table as an array of html strings (use headers if any)</option>');
				$action.append('<option value="tables to arrays of html with first row as headers">Store the table as an array of html strings (use the first row as headers)</option>');
				$action.append('<option value="tables to arrays of text">Store the table as an array of text strings (strip headers if any - html stripped)</option>');
				$action.append('<option value="tables to arrays of text with headers">Store the table as an array of text strings (use headers if any - html stripped)</option>');
				$action.append('<option value="tables to arrays of text with first row as headers">Store the table as an array of text strings (use the first row as headers - html stripped)</option>');
			}
		}

		if (!specialTagFound) {
			$action.append('<option value="get html">Get the element HTML content</option>');
			$action.append('<option value="get text">Get the element content (strip tags)</option>');				
		}
		$action.append('<option value="get attributes">None of these, just get attributes</option>');				

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
			var thisActionHtml = 			
			'<tr>'
			+ '<td>' + thisAction.niceName + '</td>'
			+ '<td>' + thisAction.selector + '</td>'
			+ '<td>' + thisAction.action + '</td> '
			+ '<td>' + thisAction.attr.join(', ') + '</td>'
			+ '<td>'
			//						+ '<button type="button" class="btn btn-primary btn-sm"><strong class="glyphicon glyphicon-pencil"></strong></button> '
			+ '<button type="button" class="btn btn-danger btn-sm"><strong class="glyphicon glyphicon-trash"></strong></button>'
			+ '</td>'
			+ '</tr>'
			;

			$('#actions-list').append(thisActionHtml);
			$('#actions-list').find('.popover-dismiss').popover();

			$('#add-action-modal').modal('hide');
			$('#actionscount').html(Object.keys(actions).length);
			$('#actionslisttab').show().effect('highlight', {}, 2000)
		}
	});

	$('#actions-list').on('click', '.remove', function() {
		$(this).parents('li').remove();
	});	


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