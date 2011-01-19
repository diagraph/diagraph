/**
 * @namespace
 */
vonline.Sidebar = function(container) {
	var that = this;
	this.container = $(container).css({width: '200px'});
	this.topmenu = $('<div/>').appendTo(this.container),
	this.categories  = $('<div/>').appendTo(this.container).addClass('categories').css('width', '200px'),
	this.extraview = $('<div/>').appendTo(this.container).addClass('extraview').hide().css('width', '200px'),
	this.bottommenu  = $('<div/>').appendTo(this.container);
	
	function onResize() {
		var height = $(window).height() - that.topmenu.height() - that.bottommenu.height();
		that.categories.height(height);
		that.extraview.height(height).css({position: 'absolute', width: '200px', left: '200px', top: that.topmenu.height()+'px'});
	}
	$(window).bind('resize', onResize);
}

vonline.Sidebar.prototype.setTopMenu = function(menu) {
	this.topmenu.html(menu.getHTML());
}

vonline.Sidebar.prototype.setBottomMenu = function(menu) {
	this.bottommenu.html(menu.getHTML());
}

vonline.Sidebar.prototype.addCategory = function(category) {
	this.categories.append(category.getHTML());
}

/**
 * @param {boolean} mode
 * @return extraview reference to dom-object
 */
vonline.Sidebar.prototype.setExtraView = function(mode) {
	if (mode) {
		this.container.css('width', '400px');
		return this.extraview.show();
	}
	else {
		this.container.css('width', '200px');
		this.extraview.hide();
	}
}