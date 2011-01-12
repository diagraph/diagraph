/**
 * Base class for canvas objects
 */
vonline.Base = function() {
	// data and object needs to be always in sync
	this.data = null;
	this.obj = null;
}

vonline.Base.prototype.getId = function() {
	return this.data.id;
}

/**
 * @param {vonline.Canvas} canvas
 */
vonline.Base.prototype.setCanvas = function(canvas) {
	this.obj = this.createObject(canvas.getPaper());
}

vonline.Base.prototype.toJSON = function() {
	return this.data;
}