
vonline.Document = function() {
	this.menu_content = new vonline.menu_content('#menu_content');
}

vonline.menu_content = function(container) {
	var menu = $("#menu_content");
	
	// *schachtel schachtel*
	$.get('html/menu_category.html', function(menu_category_data) {
		$.get('html/menu_category_item.html', function(menu_category_item_data) {
			$.post('db.php', { type: "get_categories" }, function(category_data) {
				var menu_data = "";
				for(cat = 0; cat < category_data.category_count; cat++) {
				   var cur_data = menu_category_data;
				   cur_data = cur_data.replace("{VO_MENU_CATEGORY_NAME}", category_data.categories[cat].name);
				   cur_data = cur_data.replace("{VO_MENU_CATEGORY_NAME_LC}", category_data.categories[cat].name.toLowerCase());
				   cur_data = cur_data.replace("{VO_MENU_CATEGORY_CONTENT}", "TBD");
				   menu_data += cur_data;
				}
				menu.html(menu_data);
			}, "json");
		});
	});
}
