var tabCount = 1;
$(function(){
	$.getJSON(host + '/tmp/' + file + '.json', function( project ) {
		$('#url').val(project.url);
		console.log(project);
		for (var name in project.data) {
			// create a tab
			if (tabCount == 1) {
				var active = ' class="active"';
			} else {
				var active = '';
			}
			$('#tabnav').append('<li' + active + '><a href="#tab_' + tabCount + '" role="tab" data-toggle="tab">' + name + '</li>');
			// create tab content div
			if (tabCount == 1) {
				var active = ' in active';
			} else {
				var active = '';
			}
			$('#tabcontents').append('<div class="tab-pane fade' + active + '" id="tab_' + tabCount + '" style="padding-top: 1.2em;"></div>');
			// create data table
			var $table = $('<table id="table_id' + tabCount + '" class="table table-hover"><thead></thead><tbody></tbody></table>');
			if (!$.isArray(project.data[name][0])) {
				// the data are in an object, use the keys as headers
				var $tr = $('<tr></tr>');
				for (var i in project.data[name][0]) {
					$tr.append('<th>' + i + '</th>');
				}
				$('thead', $table).append($tr);
			}
			for (var i in project.data[name]) {
				var $tr = $('<tr></tr>');
				for (var j in project.data[name][i]) {
						$tr.append('<td>' + project.data[name][i][j] + '</td>');
				}
				$('tbody', $table).append($tr);
			}
			$('#tab_' + tabCount).html($table);
			$('#table_id' + tabCount).DataTable();
			$('body').find('.dataTables_wrapper input', '.dataTables_wrapper select').addClass('form-control input-sm').css({'display':'inline-block','width':'auto'});
			tabCount++;
		}

		$('#loading').hide(200);
	});
	$('#btn_examine_again').click(function(e){
		e.preventDefault();
		$('#examine_again').submit();
	});
});
