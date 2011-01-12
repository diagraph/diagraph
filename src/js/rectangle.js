/**
 * 
 */
vonline.Rectangle = function(data) {
	this.data = data;
	this.obj = null;
	this.defaultWidth = 50;
	this.defaultHeight = 50;
}

vonline.Rectangle.prototype = vonline.Base.prototype;

vonline.Rectangle.prototype.createObject = function(canvas) {
	return canvas.rect(this.data.x, this.data.y, this.defaultWidth * this.data.scaleX, this.defaultHeight * this.data.scaleY);
}