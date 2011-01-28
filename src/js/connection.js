/**
 * @namespace
 * @augments vonline.Base
 */
vonline.Connection = function(data) {
	// inherit default values
	this.data = $.extend({}, this.data, data);
	this.resizeable = false;
}

vonline.Connection.prototype = new vonline.Base();

vonline.Connection.prototype.setCanvas = function(canvas) {
	vonline.Base.prototype.setCanvas.call(this, canvas);
	if(canvas && this.obj) {
		this.obj.node.id = 'connection_'+this.data.id;
		this.setColor('none');
	}
}

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
	var sourceBBox = this.sourceObject.obj.getBBox(),
	targetBBox = this.targetObject.obj.getBBox();
	return vonline.Connection.computePath(sourceBBox.x+sourceBBox.width/2, sourceBBox.y+sourceBBox.height/2,
										  targetBBox.x+targetBBox.width/2, targetBBox.y+targetBBox.height/2);
}

vonline.Connection.prototype.updatePath = function() {
	this.obj.attr('path', this.getPath());
}

/**
 * Static method to compute/generate a path between the two points (x1, y1) and (x2, y2)
 * @param {float} x1
 * @param {float} y1
 * @param {float} x2
 * @param {float} y2
 */
vonline.Connection.computePath = function(x1, y1, x2, y2) {
	var path = 'M0,0';
	var start = { x: x1, y: y1 };
	var end = { x: x2, y: y2 };
	if(Math.abs(start.x - end.x) < 50 || Math.abs(start.y - end.y) < 50) {
		// if angle is too shallow, use a straight line
		path = 'M' + start.x + ' ' + start.y +
			   'L' + end.x + ' ' + end.y;
	}
	else {
		// else: use a nice bezier curve
		var c = { x: (end.x - start.x)/4, y: (end.y - start.y)/4 };
		path = 'M' + start.x + ' ' + start.y +
		       'C' + (start.x+c.x*3) + ' ' + (start.y+c.y) + ' ' + (start.x+c.x) + ' ' + (start.y+c.y*3) + ' ' + end.x + ' ' + end.y;
	}
	
	return path;
}

// TODO: better inheritance
vonline.Connection.prototype.setPosition = function(x, y) {}
vonline.Connection.prototype.setTranslation = function(x, y) {}
vonline.Connection.prototype.setScale = function(x, y, origX, origY) {}
vonline.Connection.prototype.setRotation = function(deg) {}
vonline.Connection.prototype.createText = function() {}
vonline.Connection.prototype.setDragEventMode = function() {}
//vonline.Connection.prototype.setClickEventMode = function() {}
vonline.Connection.prototype.setRotationMode = function() {}
vonline.Connection.prototype.setConnectionMode = function() {}
vonline.Connection.prototype.setAnnotationMode = function() {}
vonline.Connection.prototype.setTextMode = function() {}
