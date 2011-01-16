/**
 * @namespace
 */
vonline.Category = function(name, id) {
	var that = this;
	this.id = id;
	this.container = $('<div/>').addClass('category');
	this.header = $('<div/>').addClass('header').appendTo(this.container).text(name);
	this.handle = $('<span/>').addClass('handle active').appendTo(this.header).click(function() {
		that.toggle();
	});
	this.button = $('<span/>').addClass('button').appendTo(this.header);
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

vonline.Category.prototype.open = function() {
	this.body.show();
	this.handle.addClass('active');
}

vonline.Category.prototype.close = function() {
	this.body.hide();
	this.handle.removeClass('active');
}

vonline.Category.prototype.toggle = function() {
	if (this.handle.hasClass('active')) {
		this.close();
	}
	else {
		this.open();
	}
}

/**
 * @param {string} mode
 * @param {function} onclick
 */
vonline.Category.prototype.setMode = function(mode, onclick) {
	this.button.removeClass('add').removeClass('remove');
	if (!mode) {
		this.button.unbind('click');
	}
	else {
		this.button.addClass(mode);
		this.button.click(function() {
			onclick();
		});
	}
}