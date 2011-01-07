/**
 * 
 */
vonline.Category = function(name) {
	var container = $('<div/>').addClass('category'),
	header = $('<div/>').addClass('header').appendTo(container).text(name),
	handle = $('<span/>').addClass('handle active').appendTo(header).click(function() {
		if (handle.hasClass('active')) {
			body.hide();
		}
		else {
			body.show();
		}
		handle.toggleClass('active');
	}),
	body = $('<div/>').appendTo(container).text('test');
	
	this.getHTML = function() {
		return container;
	}
}