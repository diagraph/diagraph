/**
 * @namespace
 */
vonline.Category = function(name, id) {
	var that = this;
	this.container = $('<div/>').addClass('category');
	this.header = $('<div/>').addClass('header').appendTo(this.container).text(name);
	this.handle = $('<span/>').addClass('handle active').appendTo(this.header).click(function() {
		if (that.handle.hasClass('active')) {
			that.body.hide();
		}
		else {
			that.body.show();
		}
		that.handle.toggleClass('active');
	});
	this.body = $('<div/>').appendTo(this.container);
}

vonline.Category.prototype.getHTML = function() {
	return this.container;
}

/**
 * @param {vonline.CategoryItem}
 */
vonline.Category.prototype.add = function(element) {
	this.body.append(element.getHTML());
}