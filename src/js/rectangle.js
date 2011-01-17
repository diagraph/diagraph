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
	return canvas.rect(this.data.x, this.data.y, this.data.width, this.data.height);
}

vonline.Rectangle.prototype.setScale = function(x, y, origX, origY) {
	// scale object and compute new position of the object (according to its rotation)
	this.obj.rotate(0, true); // unrotate, b/c selection.js rotates around old center
	this.obj.scale(x, y, origX, origY);
	this.obj.resetScale();  // get cumulative scaling
	
	var bbox = this.obj.getBBox();
	var x_diff = (this.obj.attr('width') - this.data.width) * (origX > bbox.x ? -1 : 1);
	var y_diff = (this.obj.attr('height') - this.data.height) * (origY > bbox.y ? -1 : 1);
	
	// lots of sign swapping, b/c the origin isn't at the bottem left
	var angle = -this.data.rotation * Math.PI/180;
	var x_new = (x_diff*Math.cos(angle) + y_diff*Math.sin(angle)) / 2;
	var y_new = (x_diff*Math.sin(angle) - y_diff*Math.cos(angle)) / 2;
	this.obj.translate(x_new, -y_new);
	this.obj.translate(-(x_diff/2), -(y_diff/2));
	
	this.obj.rotate(this.data.rotation, true); // reset rotation
	
	//
	this.data.x = this.obj.attr('x');
	this.data.y = this.obj.attr('y');
	this.data.width = this.obj.attr('width');
	this.data.height = this.obj.attr('height');
	$(this.obj.node).trigger('changed');
}