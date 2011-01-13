/**
 * @namespace
 * @constructor
 * @param {vonline.Base} object
 * @param {integer} x
 * @param {integer} y
 */
vonline.TranslateCommand = function(object, x, y) {
	this.object = object;
	this.x = x;
	this.y = y;
}

vonline.TranslateCommand.prototype.execute = function() {
	this.object.setTranslation(this.x, this.y);
}

vonline.TranslateCommand.prototype.undo = function() {
	this.object.setTranslation(-this.x, -this.y);
}