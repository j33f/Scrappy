$(function(){
	var gotLocalStorage = function() {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	};

	if (!gotLocalStorage()) {
		bootbox.alert('Your current browser seems to be a beautiful piece of holly crap, please, consider <a href="http://browsehappy.com/">downloading an up to date one</a>.');
	} else {
		if (!localStorage.scrappyActions) localStorage['scrappyActions'] =  JSON.stringify({});
		var ls = JSON.parse(localStorage.scrappyActions);
		if (Object.keys(ls).length) {
			var html = ''
			for (var name in ls) {
				if (name != '__current') {
					html += '<tr data-name="name"><td><strong>' + name + '</strong> - ' + ls[name].url + '</td>';
					html += '<td><form action="examine" method="post">';
					html += '<input type="hidden" name="url" value="' + ls[name].url + '">';
					html += '<input type="hidden" name="load" value="' + name + '">';
					html += '<button class="btn btn-primary  pull-right">Load this project</button> ';
					html += '</form></td>';
					html += '<td><button type="button" class="btn btn-danger pull-right delproject" data-name="' + name + '"><strong class="glyphicon glyphicon-trash"></strong></button></td></tr>';
				}
			}
			$('#projects').html(html);
			$('#storedprojects').show();
			$('#projects').on('click', '.delproject', function() {
				var name = $(this).data('name');
				var $tr = $(this).parents('tr')
				bootbox.confirm('You are about to delete the project named "' + name + '".', function(ok) {
					if (ok) {
						$tr.hide(200, function(){
							delete ls[name];
							if (Object.keys(ls).length == 0) {
								$('#storedprojects').hide(200);
							}
							localStorage.scrappyActions = JSON.stringify(ls);
							$tr.remove();
						});
					}
				});
			});
		}
	}
});