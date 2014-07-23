$(function(){
	var actionsCount = 1;
	$('#add').click(function(){
		$('#actions-list').append(
			'<li id="line'+actionsCount+'">'
				+'<div class="form-group">'
	    			+'<label for="selector'+actionsCount+'">jQuery selector: </label>'
	    			+'<input type="text" class="form-control" id="selector'+actionsCount+'" name="selector[]">'
	    		+'</div>'
				+'<div class="form-group">'
	    			+'<label for="selector'+actionsCount+'">Action: </label>'
	    			+'<select class="form-control" id="action'+actionsCount+'" name="action[]">'
	    				+'<option value="follow-link">Follow link</option>'
	    				+'<option value="store-value">Store value</option>'
	    			+'</select>'
	    		+'</div>'
	    		+'<span><button type="button" class="test btn btn-info btn-sm">Test</button></span> '
	    		+'<button type="button" class="remove btn btn-danger btn-sm">Remove</button>'
	    	+'</li>'
		);
	});
	$('#actions-list').on('click', '.remove', function() {
		$(this).parents('li').remove();
	});
	$('#actions-list').on('click', '.test', function() {
		var that = $(this);
		that.parent().find('small').remove();
		$.post('../scrap/check/', {url: url, selector: that.parents('li').find('input[type="text"]').val()}, function(response){
			that.parent().find('small').remove();
			that.parent().append('<small class="sample">Sample: «'+response.sample+'» ('+response.count+')</small> ');		
		});
	});

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
});