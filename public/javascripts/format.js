var project;
var tabCount = 1;
$(function(){
	$.getJSON(host + '/tmp/' + file + '.json', function( project ) {
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
			$('#tabcontents').append('<div class="tab-pane fade' + active + '" id="tab_' + tabCount + '"></div>');
			// create data table
			var $table = $('<table class="table table-hover"><thead></thead><tbody></tbody></table>');
			if (!$.isArray(project.data[name][0][0])) {
				// the data are in an object, use the keys as headers
				var $tr = $('<tr></tr>');
				for (var i in project.data[name][0][0]) {
					$tr.append('<th>' + i + '</th>');
				}
				$('thead', $table).append($tr);
			}
			for (var i in project.data[name]) {
				for (var j in project.data[name][i]) {
					var $tr = $('<tr></tr>');
					for (var k in project.data[name][i][j]) {
						$tr.append('<td>' + project.data[name][i][j][k] + '</td>');
					}
					$('tbody', $table).append($tr);
				}
			}
			$('#tab_' + tabCount).html($table);
			tabCount++;
		}
		$('#loading').hide(200);
	});
});
