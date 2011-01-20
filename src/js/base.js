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
		/** [id, id] */
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
	if (!canvas && this.obj) {
		// remove
		this.obj.remove();
		if (this.text) {
			this.text.remove();
		}
		return;
	}
	this.canvas = canvas;
	this.obj = this.createObject(canvas);
	this.setPosition(this.data.x, this.data.y);
	this.setRotation(this.data.rotation);
	this.setColor(this.data.color);
	this.createText(canvas);
	
	this.setClickEventMode(true);
	this.setDragEventMode(this);
	
	this.obj.node.id = 'object_'+this.data.id;
}

/**
 * Set the position of the component
 * Note that this function sets the absolute position by the top-left corner of the bounding box
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
	$(this.obj.node).trigger('changed');
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
	this.obj.rotate(deg, true);
	this.data.rotation = deg;
	$(this.obj.node).trigger('changed');
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
 * creates a text within the object
 */
vonline.Base.prototype.createText = function() {
	var that = this;
	this.textShowEvent = function() {
		that.text.show();
	};
	this.textHideEvent = function(event) {
		if (!$(event.relatedTarget).is('tspan')) {
			that.text.hide();
		}
	};
	
	if (this.data.text) {
		this.text = this.canvas.getPaper().text(this.data.x, this.data.y, this.data.text);
	}
	else {
		this.text = this.canvas.getPaper().text(this.data.x, this.data.y, 'dblclick\nto add');
		this.text.hide();
		$(this.obj.node).mouseenter(this.textShowEvent);
		$(this.obj.node).mouseout(this.textHideEvent);
	}
	
	// redirect events to object
	$(this.text.node).click(function(event) {
		$(that.obj.node).trigger(event);
	});
	$(this.text.node).mousedown(function(event) {
		$(that.obj.node).trigger(event);
	});
	
	// reposition on change
	this.adjustText();
	$(this.obj.node).bind('changed', function() {
		that.adjustText();
	});
	
	// text changing
	$(this.text.node).dblclick(function() {
		var entered = window.prompt('Enter a new value:');
		if (entered !== null) {
			var command = new vonline.TextChangeCommand(that, entered);
			command.execute();
			vonline.events.trigger('commandexec', command);
		}
	});
	
	$(this.obj.node).trigger('textchanged');
}

/**
 * @param {string} text
 */
vonline.Base.prototype.changeText = function(text) {
	this.data.text = text;
	this.text.remove();
	$(this.obj.node).unbind('mouseenter', this.textShowEvent);
	$(this.obj.node).unbind('mouseout', this.textHideEvent);
	this.createText();
}

/**
 * sets the correct position of the inlined text
 */
vonline.Base.prototype.adjustText = function() {
	var bbox = this.obj.getBBox();
	this.text.attr('x', bbox.x + bbox.width / 2);
	this.text.attr('y', bbox.y + bbox.height / 2);
	this.text.rotate(this.data.rotation, true);
}

/**
 * Returns the JSON representation of the object
 * @return {json} this.data 
 */
vonline.Base.prototype.toJSON = function() {
	return this.data;
}

/**
 * @param {array / vonline.Base} objects
 * @param {function} ondrag is executed on drag (e.g. for updating interface)
 */
vonline.Base.prototype.setDragEventMode = function(objects, ondrag) {
	if (!$.isArray(objects)) {
		objects = [objects];
	}
	if (!ondrag) {
		ondrag = function() {};
	}
	
	var that = this;
	this.obj.attr('cursor', 'pointer');
	
	if (this.dragEventHandler) {
		$(this.obj.node).unbind('mousedown', this.dragEventHandler);
	}
	/**
	 * catches the mouse events
	 */
	this.dragEventHandler = function(event) {
		that.obj.attr('cursor', 'move');
		
		// prevent selecting text
		event.preventDefault();
		event.stopPropagation();
		
		var origX = x = event.pageX,
			origY = y = event.pageY;
		var moveEvent = function(event) {
			// distinguish between click and drag-event, see setClickHandler 
			that.wasDragging = true;
			that.setClickEventMode(false);
			
			event.preventDefault();
			event.stopPropagation();
			
			var deltaX = event.pageX - x,
				deltaY = event.pageY - y;
			if (!event.altKey) {
				$.each(objects, function(i, object) {
					var bbox = object.obj.getBBox();
					// adjust object
					object.obj.translate((Raphael.snapTo(vonline.GRIDSIZE, bbox.x) - bbox.x), (Raphael.snapTo(vonline.GRIDSIZE, bbox.y) - bbox.y));
				});
				event.pageX = Raphael.snapTo(vonline.GRIDSIZE, event.pageX);
				deltaX = Raphael.snapTo(vonline.GRIDSIZE, event.pageX - x);
				event.pageY = Raphael.snapTo(vonline.GRIDSIZE, event.pageY);
				deltaY = Raphael.snapTo(vonline.GRIDSIZE, event.pageY - y);
			}
			$.each(objects, function(i, object) {
				object.setTranslation(deltaX, deltaY);
			});
			x = event.pageX;
			y = event.pageY;
			
			ondrag();
		} 
		$(window).mousemove(moveEvent);
		$(window).one('mouseup', function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			$(window).unbind('mousemove', moveEvent);
			if (that.wasDragging) {
				var translateX = (x - origX),
					translateY = (y - origY);
				vonline.events.trigger('commandexec', new vonline.TranslateCommand(objects, translateX, translateY));
				that.wasDragging = false;
				window.setTimeout(function() {
					that.setClickEventMode(true);
				}, 0);
			}
			that.obj.attr('cursor', 'pointer');
		});
	};
	$(this.obj.node).mousedown(this.dragEventHandler);
}

/**
 * @param {boolean} active
 */
vonline.Base.prototype.setClickEventMode = function(active) {
	var that = this;
	if (active) {
		this.clickEventHandler = function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			vonline.document.canvas.selection.toggle(that);
		}
		$(this.obj.node).click(this.clickEventHandler);
	}
	else {
		$(this.obj.node).unbind('click', this.clickEventHandler);
	}
}

/**
 * @param {boolean} active
 */
vonline.Base.prototype.setRotationMode = function(active) {
	var bbox = this.obj.getBBox(),
	radius = Math.sqrt(Math.pow(bbox.width / 2, 2) + Math.pow(bbox.height / 2, 2)) + 20,
	centerX = bbox.x + bbox.width / 2,
	centerY = bbox.y + bbox.height / 2,
	that = this;
	
	if (active) {
		/**
		 * updates rotation-circle and rotation-handle on object changes
		 */
		this.updateRotationHandles = function() {
			var newBBox = that.obj.getBBox(),
			newRadius = Math.sqrt(Math.pow(newBBox.width / 2, 2) + Math.pow(newBBox.height / 2, 2)) + 20,
			newCenterX = newBBox.x + newBBox.width / 2,
			newCenterY = newBBox.y + newBBox.height / 2;
			if (that.rotationCircle) {
				if (radius != newRadius) {
					that.rotationCircle.scale(newRadius/radius, newRadius/radius);
					that.rotationCircle.resetScale();
					that.rotationCircle.translate(newCenterX - centerX, newCenterY - centerY);
					that.rotationHandle.rotate(0, centerX, centerY);
					that.rotationHandle.translate(newCenterX - centerX, newCenterY - newRadius - (centerY - radius));
					that.rotationHandle.rotate(that.data.rotation, newCenterX, newCenterY);
					radius = newRadius;
					centerX = newCenterX;
					centerY = newCenterY;
				}
				else if (centerX != newCenterX || centerY != newCenterY) {
					that.rotationCircle.translate(newCenterX - centerX, newCenterY - centerY);
					that.rotationHandle.translate(newCenterX - centerX, newCenterY - newRadius - (centerY - radius));
					centerX = newCenterX;
					centerY = newCenterY;
				}
			}
		}
		$(this.obj.node).bind('changed', this.updateRotationHandles);
		
		this.rotationCircle = this.canvas.getPaper().circle(centerX, centerY, radius).attr('stroke', 'orange').attr('stroke-width', '2');
		this.rotationHandle = this.canvas.getPaper().circle(centerX, centerY - radius, 4).attr('stroke', 'none').attr('fill', 'orange').attr('cursor', 'pointer').rotate(this.data.rotation, centerX, centerY);
		this.rotationInfo = this.canvas.getPaper().text(0, 0, "").attr('font-size', 16).attr('font-weight', 'bold').attr('fill', 'orangered').hide();
		$(this.rotationHandle.node).mousedown(function(event) {
			event.stopPropagation();
			
			// disable/hide everything, but the rotation controls
			that.setConnectionMode(false);
			that.setAnnotationMode(false);
			that.setTextMode(false);
			that.canvas.selection.setSelectionMode(false);
			that.rotationInfo.show();
			
			var deg = that.data.rotation,
			rotationEvent = function(event) {
				event = that.canvas.normalizeEvent(event);
				deg = Raphael.angle(centerX, centerY, event.offsetX, event.offsetY);
				deg -= 90;
				deg = deg < 0 ? 360 + deg : deg;
				that.rotationHandle.rotate(deg, centerX, centerY);
				that.obj.rotate(deg, true);
				that.rotationHandle.attr({fill: 'yellow'});
				
				var angle = -deg * Math.PI/180; 
				var infoPos = { x: -(radius+25)*Math.sin(angle), y: -(radius+25)*Math.cos(angle) };
				that.rotationInfo.attr({text: Math.round(deg)+'°', x: centerX+infoPos.x, y: centerY+infoPos.y});
			};
			$(window).mousemove(rotationEvent);
			$(window).one('mouseup', function() {
				$(window).unbind('mousemove', rotationEvent);
				var command = new vonline.RotateCommand(that, deg);
				command.execute();
				vonline.events.trigger('commandexec', command);
				
				// enable/show everything again
				that.setConnectionMode(true);
				that.setAnnotationMode(true);
				that.setTextMode(true);
				that.canvas.selection.setSelectionMode(true);
				
				that.rotationHandle.attr({fill: 'orange'});
				that.rotationInfo.hide();
			});
		})
		.mouseover(function(event) {
			that.rotationHandle.attr({fill: 'yellow'});
		})
		.mouseout(function(event) {
			that.rotationHandle.attr({fill: 'orange'});
		});
	}
	else {
		$(this.obj.node).unbind('changed', this.updateRotationHandles);
		if (this.rotationCircle) {
			this.rotationCircle.remove();
			this.rotationCircle = null;
		}
		if (this.rotationHandle) {
			this.rotationHandle.remove();
			this.rotationHandle = null;
		}
	}
}

/**
 * show connection handles
 */
vonline.Base.prototype.setConnectionMode = function(active) {
	var that = this
	
	if (active) {
		var bbox = this.obj.getBBox();
		this.updateConnectionHandles = function() {
			if (that.connectionHandle) {
				newBBox = that.obj.getBBox();
				that.connectionHandle.translate(newBBox.x - bbox.x + newBBox.width - bbox.width, newBBox.y - bbox.y + newBBox.height - bbox.height);
				that.connectionHandle.rotate(that.data.rotation, newBBox.x + newBBox.width/2, newBBox.y + newBBox.height/2);
				bbox = newBBox;
			}
		}
		$(this.obj.node).bind('changed', this.updateConnectionHandles);
		
		// create connection handle
		this.connectionHandle = this.canvas.getPaper().path('M25.06,13.719c-0.944-5.172-5.461-9.094-10.903-9.094v4c3.917,0.006,7.085,3.176,7.094,7.094c-0.009,3.917-3.177,7.085-7.094,7.093v4.002c5.442-0.004,9.959-3.926,10.903-9.096h4.69v-3.999H25.06zM20.375,15.719c0-3.435-2.784-6.219-6.219-6.219c-2.733,0-5.05,1.766-5.884,4.218H1.438v4.001h6.834c0.833,2.452,3.15,4.219,5.884,4.219C17.591,21.938,20.375,19.153,20.375,15.719z').attr({fill: "green", stroke: "none"}).scale(.6,.6,0,0).attr('cursor', 'pointer');
		var handleBBox = this.connectionHandle.getBBox();
		this.connectionHandle.translate(bbox.x + bbox.width - handleBBox.width - 3, bbox.y + bbox.height - handleBBox.height - 5);
		this.connectionHandle.rotate(this.data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
		
		// handles events
		$(this.connectionHandle.node).mousedown(function(event) {
			event.stopPropagation();
		});
		$(this.connectionHandle.node).click(function(event) {
			event.stopPropagation();
			
			that.canvas.selection.setConnectionMode(true);
			that.canvas.container.one('click', function(event) {
				that.canvas.selection.setConnectionMode(false);
				// abort if user clicks on canvas or the same object
				if (event.target.id && event.target.id.substr(0, 7) == 'object_' && that.obj.node.id != event.target.id) {
					// see vonline.Document
					vonline.events.trigger('drop', {type:'connection', connect: [that.obj.node.id.replace(/object_/, ''), event.target.id.replace(/object_/, '')]});
				}
			});
		});
	}
	else {
		$(this.obj.node).unbind('changed', this.updateConnectionHandles);
		this.connectionHandle.remove();
		this.connectionHandle = null;
	}
}

/**
 * show annotation handles
 */
vonline.Base.prototype.setAnnotationMode = function(active) {
	var that = this
	
	if (active) {
		var bbox = this.obj.getBBox();
		this.updateAnnotationHandle = function() {
			if (that.annotationHandle) {
				newBBox = that.obj.getBBox();
				that.annotationHandle.translate(newBBox.x - bbox.x + newBBox.width - bbox.width, newBBox.y - bbox.y + newBBox.height - bbox.height);
				that.annotationHandle.rotate(that.data.rotation, newBBox.x + newBBox.width/2, newBBox.y + newBBox.height/2);
				bbox = newBBox;
			}
		}
		$(this.obj.node).bind('changed', this.updateAnnotationHandle);
		
		// create connection handle
		this.annotationHandle = this.canvas.getPaper().path('M14.263,2.826H7.904L2.702,8.028v6.359L18.405,30.09l11.561-11.562L14.263,2.826zM6.495,8.859c-0.619-0.619-0.619-1.622,0-2.24C7.114,6,8.117,6,8.736,6.619c0.62,0.62,0.619,1.621,0,2.241C8.117,9.479,7.114,9.479,6.495,8.859z').attr({fill: "black", stroke: "none"}).scale(.6,.6,0,0).attr('cursor', 'pointer');
		var handleBBox = this.annotationHandle.getBBox();
		this.annotationHandle.translate(bbox.x + bbox.width - handleBBox.width - 3, bbox.y);
		this.annotationHandle.rotate(this.data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
		
		// handles events
		$(this.annotationHandle.node).mousedown(function(event) {
			event.stopPropagation();
		});
		$(this.annotationHandle.node).click(function(event) {
			event.stopPropagation();
			
			var annotation = window.prompt('Enter an annotation:');
			if (annotation) {
				// see vonline.Document
				vonline.events.trigger('drop', {type:'annotation', text: annotation, connect: that.data.id, x: that.data.width + 20, y: 0});
			}
		});
	}
	else {
		$(this.obj.node).unbind('changed', this.updateAnnotationHandle);
		this.annotationHandle.remove();
		this.annotationHandle = null;
	}
}

/**
 * enables/disables the object text show/hide event
 */
vonline.Base.prototype.setTextMode = function(active) {
	if (active) {
		this.text.show();
		$(this.obj.node).mouseenter(this.textShowEvent);
		$(this.obj.node).mouseout(this.textHideEvent);
	}
	else {
		this.text.hide();
		$(this.obj.node).unbind('mouseenter', this.textShowEvent);
		$(this.obj.node).unbind('mouseout', this.textHideEvent);
	}
}

/**
 * Checks if bounding contains the current object
 * @param {object} bounding Specified by (x, y, width, height)
 */
vonline.Base.prototype.fitsIn = function(bounding) {
	var bbox = this.obj.getBBox();
	return (bbox.x >= bounding.x && bbox.y >= bounding.y
			&& bbox.x + bbox.width <= bounding.x + bounding.width
			&& bbox.y + bbox.height <= bounding.y + bounding.height);
}