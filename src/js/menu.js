/**
 * container for the menu items
 * @namespace
 */
vonline.Menu = function() {
	this.container = $('<ul/>').addClass('menu');
}

/**
 * returns html representation
 */
vonline.Menu.prototype.getHTML = function() {
	return this.container;
}

/**
 * adds an item to the menu
 * @param {vonline.MenuItem} item
 */
vonline.Menu.prototype.addItem = function(item) {
	this.container.append(item.getHTML());
}