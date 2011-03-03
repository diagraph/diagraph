/**
 * @namespace
 * @constructor
 * @param {vonline.Base array} objects
 * @param {number} scaleX
 * @param {number} scaleY
 * @param {number} x
 * @param {number} y
 * @param {number} direction
 */
vonline.ScaleCommand = function(objects, scaleX, scaleY, x, y, direction) {
	this.objects = objects;
	this.scaleX = scaleX;
	this.scaleY = scaleY;
	this.x = x;
	this.y = y;
	this.direction = direction;
	
	this.singleObject = (this.objects.length == 1);
	this.translateX = 0;
	this.translateY = 0;
	
	// single object scaling differs from multiple object rotation:
	//  * single object: scale object directly on the side of the handle (regarding the object rotation)
	//  * multiple objects: scale objects in the direction of the scale handle (ignoring the object rotation)
	if(this.singleObject) {
		// compute new position of the object (according to its rotation)
		var bbox = this.objects[0].obj.getBBox();
		var x_diff = (bbox.width - (bbox.width / this.scaleX));
		var y_diff = (bbox.height - (bbox.height / this.scaleY));
		
		if(direction == 'w') x_diff = -x_diff;
		if(direction == 'n') y_diff = -y_diff;
		if (direction == 'sw') x_diff = -x_diff;
		if (direction == 'nw') {
			x_diff = -x_diff;
			y_diff = -y_diff;
		}
		if(direction == 'ne') y_diff = -y_diff;
		
		// lots of sign swapping, b/c the origin isn't at the bottem left
		var angle = -this.objects[0].data.rotation * Math.PI/180;
		var x_new = (x_diff*Math.cos(angle) + y_diff*Math.sin(angle)) / 2;
		var y_new = (x_diff*Math.sin(angle) - y_diff*Math.cos(angle)) / 2;
		
		this.translateX = x_new - x_diff/2;
		this.translateY = -y_new - y_diff/2;
	}
	else {
		// TODO: implement this
	}
}

vonline.ScaleCommand.prototype.execute = function() {
	var rotation;
	if(this.singleObject) {
		// unset rotation before we scale the object
		rotation = this.objects[0].data.rotation;
		this.objects[0].setRotation(0);
	}
	
	for (var i = 0, count = this.objects.length; i < count; i++) {
		this.objects[i].setScale(this.scaleX, this.scaleY, this.x, this.y);
	}
	
	if(this.singleObject) {
		this.objects[0].setTranslation(this.translateX, this.translateY);
		this.objects[0].setRotation(rotation);
	}
}

vonline.ScaleCommand.prototype.undo = function() {
	var rotation;
	if(this.singleObject) {
		// unset rotation before we scale the object
		rotation = this.objects[0].data.rotation;
		this.objects[0].setRotation(0);
		this.objects[0].setTranslation(-this.translateX, -this.translateY);
	}
	
	for (var i = 0, count = this.objects.length; i < count; i++) {
		this.objects[i].setScale(1 / this.scaleX, 1 / this.scaleY, this.x, this.y);
	}
	
	if(this.singleObject) {
		this.objects[0].setRotation(rotation);
	}
}