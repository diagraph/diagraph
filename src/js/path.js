/**
 * @namespace
 * @augments vonline.Base
 */
vonline.Path = function(data) {
	// inherit default values
	this.data = $.extend({}, this.data, data);
}

vonline.Path.prototype = new vonline.Base();

/**
 * Creates the object on the given canvas
 * @param {vonline.Canvas} canvas
 */
vonline.Path.prototype.createObject = function(canvas) {
	return canvas.getPaper().path(this.data.path);
}

vonline.Path.prototype.setScale = function(x, y, origX, origY) {
	this.obj.scale(x, y, origX, origY);
	this.obj.resetScale();  // get cumulative scaling
	this.data.path = this.obj.attr('path');
	$(this.obj.node).trigger('changed');
}