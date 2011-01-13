/**
 * @namespace
 * @augments vonline.Base
 */
vonline.Rectangle = function(data) {
	// inherit default values
	this.data = $.extend(this.data, data);
	this.defaultWidth = 50;
	this.defaultHeight = 50;
}

vonline.Rectangle.prototype = new vonline.Base();

/**
 * Creates the object on the given canvas
 * @param {vonline.Canvas} canvas
 */
vonline.Rectangle.prototype.createObject = function(canvas) {
	return canvas.rect(this.data.x, this.data.y, this.defaultWidth * this.data.scaleX, this.defaultHeight * this.data.scaleY);
}