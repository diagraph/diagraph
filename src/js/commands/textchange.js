/**
 * @namespace
 * @constructor
 * @param {vonline.Base} object
 * @param {string} text
 */
vonline.TextChangeCommand = function(object, text) {
	this.object = object;
	this.text = text;
	this.oldText = object.data.text;
}

vonline.TextChangeCommand.prototype.execute = function() {
	this.object.changeText(this.text);
}

vonline.TextChangeCommand.prototype.undo = function() {
	this.object.changeText(this.oldText);
}