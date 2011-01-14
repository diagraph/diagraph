/**
 * @namespace
 * @constructor
 * @param {vonline.Canvas} canvas
 * @param {object} data
 */
vonline.CreateCommand = function(canvas, data) {
	this.canvas = canvas;
	this.object = this.canvas.createObject(data);
}

vonline.CreateCommand.prototype.execute = function() {
	this.canvas.add(this.object);
}

vonline.CreateCommand.prototype.undo = function() {
	this.canvas.remove(this.object);
}