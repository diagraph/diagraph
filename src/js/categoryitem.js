/**
 * @namespace
 */
vonline.CategoryItem = function(name, data) {
	var that = this;
	this.container = $('<div/>').addClass('item').attr('title', name);
	this.size = 50;
	this.padding = 20;
	this.data = null;
	
	this.canvas = Raphael(this.container[0], this.size + 2*this.padding, this.size + 2*this.padding);
	switch (data) {
	case 'rectangle':
		this.canvas.rect(this.padding, this.padding, this.size, this.size);
		this.data = {type: 'rectangle'};
		break;
	default: // path
		var path = this.canvas.path(data),
		bbox = path.getBBox(),
		// scale
		scale = Math.min(this.size / bbox.width, this.size / bbox.height);
		path.scale(scale, scale, 0, 0).translate(this.padding-bbox.x, this.padding-bbox.y);
		this.data = {type: 'path', path: path.attr('path')}
		break;
	}
	
	this.container.mousedown(function(event) {
		var x = event.pageX,
			y = event.pageY,
			offset = that.container.offset(),
			element = that.container.clone().css({position:'absolute', zIndex:2, top: offset.top+'px', left: offset.left+'px'}).appendTo(document.body);
		var dragEvent = function(event) {
			element.css({left: (offset.left + event.pageX - x)+'px', top: (offset.top + event.pageY - y)+'px'});
		}
		$(window).mousemove(dragEvent);
		$(window).one('mouseup', function(event) {
			that.data.x = offset.left + event.pageX - x - $('#sidebar').width() + that.padding;
			that.data.y = offset.top + event.pageY - y + that.padding;
			if (that.data.x > 0) {
				// see vonline.Document
				vonline.events.trigger('drop', that.data);
			}
			element.detach();
			$(window).unbind('mousemove', dragEvent);
		});
	});
}

vonline.CategoryItem.prototype.getHTML = function() {
	return this.container;
}