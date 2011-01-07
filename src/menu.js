/**
 * container for the menu items
 */
vonline.Menu = function() {
	var container = $('<ul/>').addClass('menu');
	
	this.getHTML = function() {
		return container;
	}
	
	this.addItem = function(item) {
		container.append(item.getHTML());
	}
}