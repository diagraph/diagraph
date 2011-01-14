/**
 * @namespace
 * @constructor
 * @param {vonline.Base array} objects
 * @param {number} scaleX
 * @param {number} scaleY
 * @param {number} x
 * @param {number} y
 */
vonline.ScaleCommand = function(objects, scaleX, scaleY, x, y) {
	this.objects = objects;
	this.scaleX = scaleX;
	this.scaleY = scaleY;
	this.x = x;
	this.y = y;
}

vonline.ScaleCommand.prototype.execute = function() {
	for (var i = 0, count = this.objects.length; i < count; i++) {
		this.objects[i].setScale(this.scaleX, this.scaleY, this.x, this.y);
	}
}

vonline.ScaleCommand.prototype.undo = function() {
	for (var i = 0, count = this.objects.length; i < count; i++) {
		this.objects[i].setScale(1 / this.scaleX, 1 / this.scaleY, this.x, this.y);
	}
}