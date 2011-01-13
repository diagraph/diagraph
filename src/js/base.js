/**
 * Base class for canvas objects
 * @namespace
 * @constructor
 */
vonline.Base = function() {
	// data and object needs to be always in sync
	/** default values and json format specification */
	this.data = {
		/** unique identifier */
		id: 0,
		/** 'rectangle', 'circle', 'path', 'image', 'annotation', 'connection' */
		type: null,
		/** SVG path or further differentation of type, e.g. 'arrow', 'line' */
		path: null,
		x: 0,
		y: 0,
		scaleX: 1,
		scaleY: 1,
		rotation: 0,
		/** see: http://raphaeljs.com/reference.html#colour */
		color: 'white',
		text: null,
		/** [width, color] */
		border: null,
		/** [[id, side], ...] */
		connect: null
	};
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
	this.setPosition(this.data.x, this.data.y);
	this.setScale(this.data.scaleX, this.data.scaleY);
	this.setRotation(this.data.rotation);
	this.setColor(this.data.color);
}

/**
 * @param {integer} x
 * @param {integer} y
 */
vonline.Base.prototype.setPosition = function(x, y) {
	var bbox = this.obj.getBBox(),
		currentX = bbox.x,
		currentY = bbox.y;
	this.obj.translate(x - currentX, y - currentY);
	this.x = x;
	this.y = y;
}

/**
 * @param {float} x
 * @param {float} y
 */
vonline.Base.prototype.setScale = function(x, y) {
	this.obj.scale(x, y);
	this.scaleX = x;
	this.scaleY = y;
}

/**
 * @param {int} deg Degree between 0...360°
 */
vonline.Base.prototype.setRotation = function(deg) {
	this.obj.rotate(deg);
	this.data.rotation = deg;
}

/**
 * @param {string} color
 * @see http://raphaeljs.com/reference.html#colour
 */
vonline.Base.prototype.setColor = function(color) {
	this.obj.attr({fill: color});
	this.data.color = color;
}

/**
 * Returns the JSON representation of the object
 * @return {json} this.data 
 */
vonline.Base.prototype.toJSON = function() {
	return data;
}