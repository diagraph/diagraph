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
		width: 50,
		height: 50,
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
 * Displays the element on the canvas
 * @param {vonline.Canvas} canvas
 */
vonline.Base.prototype.setCanvas = function(canvas) {
	this.obj = this.createObject(canvas.getPaper());
	this.setPosition(this.data.x, this.data.y);
	this.setColor(this.data.color);
	
	this.initClickEventHandler();
	this.initDragEventHandler();
}

/**
 * Set the position of the component
 * Note that this function sets the absolute position by the top-left edge of the bounding box
 * @param {integer} x
 * @param {integer} y
 */
vonline.Base.prototype.setPosition = function(x, y) {
	var bbox = this.obj.getBBox(),
		currentX = bbox.x,
		currentY = bbox.y;
	this.obj.translate(x - currentX, y - currentY);
	this.data.x = x;
	this.data.y = y;
}

/**
 * Translates the object by the given values
 * @param {integer} x
 * @param {integer} y
 */
vonline.Base.prototype.setTranslation = function(x, y) {
	this.obj.translate(x, y);
	this.data.x += x;
	this.data.y += y;
}

/**
 * @param {float} x
 * @param {float} y
 * @param {number} origX
 * @param {number} origY
 */
vonline.Base.prototype.setScale = function(x, y, origX, origY) {
	throw 'vonline.Base.setScale must be implemented in subclass';
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
	return this.data;
}

vonline.Base.prototype.initDragEventHandler = function() {
	var that = this;
	this.obj.attr('cursor', 'pointer');
	$(this.obj.node).mousedown(function(event) {
		// catch mouse movement
		
		that.obj.attr('cursor', 'move');
		
		// prevent selecting text
		event.preventDefault();
		event.stopPropagation();
		
		var origX = x = event.pageX,
			origY = y = event.pageY;
		var moveEvent = function(event) {
			// distinguish between click and drag-event, see initClickHandler 
			that.wasDragging = true;
			event.preventDefault();
			event.stopPropagation();
			
			if (!event.altKey) {
				event.pageX = Raphael.snapTo(vonline.GRIDSIZE, event.pageX);
				event.pageY = Raphael.snapTo(vonline.GRIDSIZE, event.pageY);
			}
			that.obj.translate(event.pageX - x, event.pageY - y);
			x = event.pageX;
			y = event.pageY;
		} 
		$(window).mousemove(moveEvent);
		$(window).one('mouseup', function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			$(window).unbind('mousemove', moveEvent);
			if (that.wasDragging) {
				var translateX = (x - origX),
					translateY = (y - origY);
				that.data.x += translateX;
				that.data.y += translateY;
				vonline.events.trigger('commandexec', new vonline.TranslateCommand(that, translateX, translateY));
			}
			that.obj.attr('cursor', 'pointer');
		});
	});
}

vonline.Base.prototype.initClickEventHandler = function() {
	var that = this;
	$(this.obj.node).click(function(event) {
		event.preventDefault();
		event.stopPropagation();
		
		if (!that.wasDragging) {
			vonline.document.canvas.selection.toggle(that);
		}
		else {
			that.wasDragging = false;
		}
	});
}