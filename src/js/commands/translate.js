/**
 * @namespace
 * @constructor
 * @param {vonline.Base array} object
 * @param {integer} x
 * @param {integer} y
 */
vonline.TranslateCommand = function(objects, x, y) {
	this.objects = objects;
	this.x = x;
	this.y = y;
}

vonline.TranslateCommand.prototype.execute = function() {
	for (var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].setTranslation(this.x, this.y);
	}
}

vonline.TranslateCommand.prototype.undo = function() {
	for (var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].setTranslation(-this.x, -this.y);
	}
}