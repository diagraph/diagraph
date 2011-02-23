/**
 * menu item, containing an image and a click-event handler
 * @namespace
 */
vonline.MenuItem = function(name, src, clickHandler) {
	var that = this,
	li = $('<li/>').attr('title', name).addClass('item'),
	image = $('<img/>').appendTo(li).bind('load', function() {
		$(window).trigger('resize'); // layout changes if images are loaded (see sidebar)
	}),
	enabled = false;
	
	function onclick() {
		// get the correct context (this object instead of the li-element)
		clickHandler.apply(that);
	}
	
	this.getHTML = function() {
		this.enable();
		return li;
	}
	
	this.disable = function() {
		if (enabled) {
			image.attr('src', src + '_disabled.png');
			li.removeClass('enabled');
			li.unbind('click', onclick);
			enabled = false;
		}
	}
	
	this.enable = function() {
		if (!enabled) {
			image.attr('src', src + '.png');
			li.addClass('enabled');
			li.click(onclick);
			enabled = true;
		}
	}
}