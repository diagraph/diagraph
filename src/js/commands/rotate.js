/**
 * @namespace
 * @constructor
 * @param {vonline.Base} object
 * @param {degree} deg 0..360°
 */
vonline.RotateCommand = function(object, deg) {
	this.object = object;
	this.deg = deg;
	this.oldDeg = this.object.data.rotation;
}

vonline.RotateCommand.prototype.execute = function() {
	this.object.setRotation(this.deg);
}

vonline.RotateCommand.prototype.undo = function() {
	this.object.setRotation(this.oldDeg);
}