
// raphael paper
var canvas;
var canvas_size = { width: 100, height: 100 };

// this updates the svg preview with the current text inside the 'import_text' textbox
function update_preview() {
	canvas.clear();
	var path = canvas.path($('#import_text').val());
	
	// scale
	var bbox = path.getBBox();
	// to prevent cut off on the canvas sides, subtract one pixel for each side
	var scale = Math.min((canvas_size.width-2) / bbox.width, (canvas_size.height-2) / bbox.height);
	path.scale(scale, scale, 0, 0);
	bbox = path.getBBox(); // new bbox after scaling
	path.translate(1-bbox.x, 1-bbox.y); // same here: offset by 1px
}

function update_categories() {
	// get categories and add them to the category combo box
	$('#import_category').text('');
	$.ajax({
		   data: { task: 'getCategories' },
		   dataType: 'json',
		   success: function(json) {
				for(var item in json) {
					$('<option value=\'' + json[item].id + '\'>' + json[item].name + '</option>').appendTo('#import_category');
				}
				$('#import_category').val(0);
		   }
	});
}

$(function() {
	$.ajaxSetup({type: 'post'});
	
	// init raphael
	canvas = Raphael(document.getElementById('preview'), canvas_size.width, canvas_size.height);
	
	// update categories
	update_categories();
	
	// handle svg file import
	$('#import_file').change(function(event) {
		var reader = new FileReader();
		reader.onload = function() {
			if(reader.result.length == 0) {
				alert('Sorry, but you can\'t add an empty file!');
				return;
			}
			
			var svg = $($.parseXML(reader.result));
			var paths = svg.find('path');
			if(paths.length == 0) {
				alert('Sorry, but your SVG image doesn\'t contain any paths!');
				return;
			}
			
			// clear old data
			$('#import_text').text('');
			$('#import_text').val('');
			
			// new data:
			var data = '';
			paths.each(function (index, path) {
				var path = $(path).attr('d');
				if(path) {
					// replace first 'm' by 'M' if it exists and isn't preceded by an 'M'
					var first_m = path.indexOf('m');
					var first_M = path.indexOf('M');
					if(first_m >= 0 && (first_M < 0 || first_M > first_m)) {
						path = path.substring(0, first_m)+'M'+path.substring(first_m+1, path.length);
					}
					
					data += path + '\n';
				}
			});
			$('#import_text').val(data);
			
			update_preview();
		}
		reader.readAsBinaryString($('#import_file')[0].files[0]);
	});
	
	// update the svg preview when the textbox changes (key input)
	$('#import_text').bind('keyup', function(event) {
		update_preview();
	});
	
	// handle form submit
	$('#import_form').submit(function(event) {
		event.preventDefault();
		
		var import_name = $('#import_name').val();
		var import_text = $('#import_text').val();
		var import_category = $('#import_category').val();
		
		$.ajax({
		   data: { task: 'import', import_name: import_name, import_text: import_text, import_category: import_category },
		   dataType: 'text',
		   success: function(text) {
				if(text == 'success') {
					alert('Import successful!');
					
					// clear form
					$('#import_name').val('');
					$('#import_file').val('');
					$('#import_text').val('');
					$('#import_category').val(0);
					update_preview();
					
					return;
				}
				
				alert('Import failed: '+text);
		   }
		});
	});
	
	// handle 'add category'
	$('#import_add_category').click(function(event) {
		var category_name = prompt('Category Name:', '');
		if(category_name == '' || category_name.length == 0) {
			alert('Category name is empty!');
			return;
		}
		else if(category_name.length > 32) {
			alert('Category name is too long! (max: 32 characters)');
			return;
		}
		
		//
		$.ajax({
		   data: { task: 'addCategory', category_name: category_name },
		   dataType: 'text',
		   success: function(text) {
				if(text == 'success') {
					alert('Category \''+category_name+'\' added successfully!');
					update_categories();
					return;
				}
				
				alert('Failed to add category: '+text);
		   }
		});
	});
});
