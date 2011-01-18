/**
 * @namespace
 * @augments vonline.Base
 */
vonline.Connection = function(data) {
	// inherit default values
	this.data = $.extend({}, this.data, data);
}

vonline.Connection.prototype = new vonline.Base();

/**
 * Creates the object on the given canvas
 * @param {vonline.Canvas} canvas
 */
vonline.Connection.prototype.createObject = function(canvas) {
	var that = this;
	
	this.sourceObject = canvas.getObjectById(this.data.connect[0]);
	this.targetObject = canvas.getObjectById(this.data.connect[1]);
	
	// event handler
	$(this.sourceObject.obj.node).bind('changed', function() {
		that.updatePath();
	});
	$(this.targetObject.obj.node).bind('changed', function() {
		that.updatePath();
	});
	
	return canvas.getPaper().path(this.getPath()).toBack();
}

vonline.Connection.prototype.getPath = function() {
	// TODO: calc better path
	var sourceBBox = this.sourceObject.obj.getBBox(),
	targetBBox = this.targetObject.obj.getBBox();
	return 'M' + (sourceBBox.x+sourceBBox.width/2) +
	' ' + (sourceBBox.y+sourceBBox.height/2) +
	'L' + (targetBBox.x+targetBBox.width/2) +
	' ' + (targetBBox.y+targetBBox.height/2);
}

vonline.Connection.prototype.updatePath = function() {
	this.obj.attr('path', this.getPath());
}

// TODO: better inheritance
vonline.Connection.prototype.setPosition = function(x, y) {}
vonline.Connection.prototype.setTranslation = function(x, y) {}
vonline.Connection.prototype.setScale = function(x, y, origX, origY) {}
vonline.Connection.prototype.setRotation = function(deg) {}
vonline.Connection.prototype.createText = function() {}
vonline.Connection.prototype.setDragEventMode = function() {}
vonline.Connection.prototype.setClickEventMode = function() {}
vonline.Connection.prototype.setRotationMode = function() {}
vonline.Connection.prototype.setConnectionMode = function() {}
vonline.Connection.prototype.setAnnotationMode = function() {}