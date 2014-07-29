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

	var cleanup = function(selector) {
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

	var pageOffset = $('#page').offset();
	$('#page').height($(window).height() - pageOffset.top - $('#main-form').height());
	var $page = $('#page').contents();
	$page.ready(function(){
		$page.find('head').append('<style>body * {cursor: crosshair!important;} .scrappy_selected_element{border: 2px solid red!important}</style>');
		$page.find("*")
			.click(function(evt) {
				evt.preventDefault();
				$page.find('.scrappy_selected_element').removeClass('scrappy_selected_element');
				var parents = [];
				var selector = '';
				$(this).parents()
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
				
				if ($('#cleanup:checked').length) {
					$('#current-selector').val(cleanup(selector));
				} else {
					$('#current-selector').val(selector);
				}

				$('#current-selector')
					.keyup()
					.effect('highlight', {}, 2000)
				;
				return false;
			});
	});

	$('#current-selector').keyup(function() {
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
});

var actions = {};

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
				$action.append('<option value="get html">Get each paragraph HTML content and concat them</option>');
				$action.append('<option value="get text">Get each paragraph content separately and concat them (strip tags)</option>');
			} else {
				$action.append('<option value="get html">Get the paragraph HTML content</option>');
				$action.append('<option value="get text">Get the paragraph content (strip tags)</option>');				
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
	})
		
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