/**
 * 
 */
vonline.Sidebar = function(container) {
	container = $(container).css('width', '200px');
	var topmenu = $('<div/>').appendTo(container),
	categories  = $('<div/>').appendTo(container),
	bottommenu  = $('<div/>').appendTo(container);
	
	function update() {
		categories.height($(window).height() - topmenu.height() - bottommenu.height());
	}
	$(window).bind('resize', update);
	
	this.setTopMenu = function(menu) {
		topmenu.html(menu.getHTML());
	}
	
	this.setBottomMenu = function(menu) {
		bottommenu.html(menu.getHTML());
	}
	
	this.addCategory = function(category) {
		categories.append(category.getHTML());
	}
}