/**
 * @namespace
 * @augments vonline.Base
 */
vonline.Rectangle = function(data) {
	// inherit default values
	this.data = $.extend({}, this.data, data);
}

//vonline.Rectangle.prototype = new vonline.Base();
vonline.Rectangle.prototype = new vonline.Base();

/**
 * Creates the object on the given canvas
 * @param {vonline.Canvas} canvas
 */
vonline.Rectangle.prototype.createObject = function(canvas) {
	return canvas.getPaper().rect(this.data.x, this.data.y, this.data.width, this.data.height);
}

vonline.Rectangle.prototype.setScale = function(x, y, origX, origY) {
	this.obj.scale(x, y, origX, origY);
	this.obj.resetScale();  // get cumulative scaling
	this.data.x = this.obj.attr('x');
	this.data.y = this.obj.attr('y');
	this.data.width = this.obj.attr('width');
	this.data.height = this.obj.attr('height');
	$(this.obj.node).trigger('changed');
}