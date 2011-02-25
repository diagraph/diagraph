/**
 * Base class for canvas objects
 * @namespace
 * @constructor
 */
vonline.Base = function() {
	// data and object needs to be always in sync
	this.data = vonline.Base.defaultData;
	this.obj = null;
	// overwrite in subclass for connections and annotations
	this.resizeable = true;
	
	this.rotationCircle = null;
	this.rotationHandle = null;
	this.connectionHandle = null;
	this.annotationHandle = null;
	this.inlineTextHandle = null;
	this.connectionPath = null;
}

/** default values and json format specification */
vonline.Base.defaultData = {
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
	color: '90-#ddd-#fff',
	text: null,
	/** [width, color] */
	border: null,
	/** [id, id] */
	connect: []
};

vonline.Base.prototype.getId = function() {
	return this.data.id;
}

vonline.Base.prototype.isResizeable = function() {
	return this.resizeable;
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
	this.obj = this.createObject(canvas).initZoom();
	this.setPosition(this.data.x, this.data.y);
	this.setRotation(this.data.rotation);
	this.setColor(this.data.color);
	this.setBorder();
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
	//$(this.obj.node).trigger('textchanged');
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

vonline.Base.prototype.setBorder = function() {
	this.obj.setAttr('stroke-width', 1);
	this.obj.setAttr('stroke', 'black');
}

/**
 * creates a text within the object
 */
vonline.Base.prototype.createText = function() {
	var that = this;
	
	if (this.data.text) {
		this.text = this.canvas.getPaper().text(this.data.x, this.data.y, this.data.text).initZoom();
		this.text.setAttr('font-size', 10);
		
		// redirect events to object
		$(this.text.node).click(function(event) {
			$(that.obj.node).trigger(event);
		});
		$(this.text.node).mousedown(function(event) {
			$(that.obj.node).trigger(event);
		});
		$(this.text.node).mousemove(function(event) {
			// fix for connection-path
			event.target = that.obj.node;
			$(that.obj.node).trigger(event);
		});
		
		// reposition on change
		this.adjustText();
		$(this.obj.node).bind('changed', function() {
			that.adjustText();
		});
		$(vonline.events).bind('zoom', function() {
			that.adjustText();
		});
		
		$(this.obj.node).trigger('textchanged');
	}
}

/**
 * @param {string} text
 */
vonline.Base.prototype.changeText = function(text) {
	this.data.text = text;
	if (this.text) {
		this.text.remove();
	}
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
	// clean up (remove default values)
	var json = {};
	for (var property in this.data) {
		if (this.data[property] != vonline.Base.defaultData[property]) {
			json[property] = this.data[property];
		}
	}
	return json;
}

/**
 * @param {boolean} active
 * @param {number} selected Number of selected objects
 */
vonline.Base.prototype.setSelection = function(active, selected) {
	if (active) {
		this.obj.attr('stroke', 'red');
		this.selected = true;
		$(this.obj.node).trigger('select');
		
		this.updateSelection(selected == 1);
		var that = this;
	}
	else {
		this.obj.attr('stroke', 'black');
		this.selected = false;
		$(this.obj.node).trigger('unselect');
		
		this.updateSelection();
	}
	if (!this.selectionHandler) {
		this.selectionHandler = vonline.events.bind('selection_changed', function(event, number) {
			that.updateSelection(number == 1);
		});
	}
}

/**
 * @param {boolean} controls Show controls
 */
vonline.Base.prototype.updateSelection = function(controls) {
	if (this.selected && controls) {
		this.setRotationMode(true);
		this.setConnectionMode(true);
		this.setAnnotationMode(true);
		this.setTextMode(true);
	}
	else {
		this.setRotationMode(false);
		this.setConnectionMode(false);
		this.setAnnotationMode(false);
		this.setTextMode(false);
	}
}

/**
 * @param {vonline.Base / array} objects
 * @param {function} ondrag (optional) is executed on drag (e.g. for updating interface)
 */
vonline.Base.prototype.setDragEventMode = function(objects, ondrag) {
	if (!$.isArray(objects)) {
		objects = [objects];
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
		
		$.each(objects, function(i, object) {
			object.setRotationMode(false);
			object.setConnectionMode(false);
			object.setAnnotationMode(false);
			object.setTextMode(false);
		});
		
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
			if (event.altKey) {
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
			
			if (ondrag) {
				ondrag();
			}
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
			
			$.each(objects, function(i, object) {
				if (object.selected) {
					object.updateSelection(objects.length == 1);
					$(object.obj.node).trigger('changed');
				}
			});
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
			
			if (event.shiftKey) {
				vonline.document.canvas.selection.toggle(that);
			}
			else {
				vonline.document.canvas.selection.clear();
				vonline.document.canvas.selection.add(that);
			}
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
	
	
	if (this.rotationCircle || this.rotationHandle) {
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
		
		this.rotationCircle = this.canvas.getPaper().circle(centerX, centerY, radius).attr('stroke', 'orange').attr('stroke-width', '1');
		this.rotationHandle = this.canvas.getPaper().circle(centerX, centerY - radius, 5.5).attr('stroke', 'none').attr('fill', 'orange').attr('cursor', 'pointer').rotate(this.data.rotation, centerX, centerY);
		this.rotationInfo = this.canvas.getPaper().text(0, 0, "").attr('font-size', 16).attr('font-weight', 'bold').attr('fill', 'orangered').hide();
		$(this.rotationHandle.node).mousedown(function(event) {
			event.stopPropagation();
			
			// disable/hide everything, but the rotation controls
			that.setConnectionMode(false);
			that.setAnnotationMode(false);
			that.setTextMode(false);
			that.canvas.selection.setSelectionMode(false);
			that.rotationInfo.show();
			that.rotationCircle.attr('stroke-width', '2');
			
			var deg = that.data.rotation,
			origDeg = that.data.rotation;
			
			function rotationEvent(event) {
				event = that.canvas.normalizeEvent(event);
				deg = Raphael.angle(centerX, centerY, event.offsetX, event.offsetY);
				deg -= 90;
				deg = deg < 0 ? 360 + deg : deg;
				if (!event.altKey) {
					deg = Raphael.snapTo(45, deg, 20);
				}
				if (deg == 360) {
					deg = 0;
				}
				that.rotationHandle.rotate(deg, centerX, centerY);
				that.obj.rotate(deg, true);
				that.rotationHandle.attr({fill: 'yellow'});
				
				var angle = -deg * Math.PI/180; 
				var infoPos = { x: -(radius+25)*Math.sin(angle), y: -(radius+25)*Math.cos(angle) };
				that.rotationInfo.attr({text: Math.round(deg)+'°', x: centerX+infoPos.x, y: centerY+infoPos.y});
			}
			
			$(window).mousemove(rotationEvent);
			$(window).one('mouseup', function() {
				$(window).unbind('mousemove', rotationEvent);
				if (deg != origDeg) {
					var command = new vonline.RotateCommand(that, deg);
					command.execute();
					vonline.events.trigger('commandexec', command);
				}
				
				// enable/show everything again
				that.setConnectionMode(true);
				that.setAnnotationMode(true);
				that.setTextMode(true);
				that.canvas.selection.setSelectionMode(true);
				
				that.rotationHandle.attr({fill: 'orange'});
				that.rotationInfo.hide();
				that.rotationCircle.attr('stroke-width', '1');
			});
		})
		.mouseover(function(event) {
			that.rotationHandle.attr({fill: 'yellow'});
		})
		.mouseout(function(event) {
			that.rotationHandle.attr({fill: 'orange'});
		});
	}
}

/**
 * show connection handles
 */
vonline.Base.prototype.setConnectionMode = function(active) {
	var that = this;
	
	if (this.connectionHandle) {
		$(this.obj.node).unbind('changed', this.updateConnectionHandles);
		this.connectionHandle.remove();
		this.connectionHandle = null;
	}
	if (active) {
		var bbox = this.obj.getBBox();
		this.updateConnectionHandles = function() {
			if (that.connectionHandle) {
				var newBBox = that.obj.getBBox();
				that.connectionHandle.translate(newBBox.x - bbox.x + newBBox.width - bbox.width, newBBox.y - bbox.y + newBBox.height - bbox.height);
				that.connectionHandle.rotate(that.data.rotation, newBBox.x + newBBox.width/2, newBBox.y + newBBox.height/2);
				bbox = newBBox;
			}
		}
		$(this.obj.node).bind('changed', this.updateConnectionHandles);
		
		// create connection handle
		this.connectionHandle = this.canvas.getPaper().image('images/canvas/connect.png', 0, 0, 22, 22).attr('cursor', 'pointer');
		var handleBBox = this.connectionHandle.getBBox();
		this.connectionHandle.translate(bbox.x + bbox.width + 20, bbox.y + 38);
		this.connectionHandle.rotate(this.data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
		
		// handles events
		if(this.connectionPath == null) {
			this.connectionPath = this.canvas.getPaper().path('M0,0').toBack();
		}
		this.connectionPath.attr('path', 'M0,0').hide();
		
		var targetObj = null, targetStrokeColor = null, targetStrokeWidth = null;
		var restoreTargetObj = function() {
			if(targetObj) {
				targetObj.obj.attr('stroke', (targetStrokeColor ? targetStrokeColor : '#000'));
				targetObj.obj.attr('stroke-width', (targetStrokeWidth ? targetStrokeWidth : '1'));
				targetObj = null, targetStrokeColor = null, targetStrokeWidth = null;
			}
		}
		var connectionMoveEvent = function(event) {
			event.preventDefault();
			event.stopPropagation();
			event = that.canvas.normalizeEvent(event);
			
			that.connectionPath.show();
			
			if ($(event.target).is('tspan')) {
				// fix for wrong connection when mousepointer over test
				return;
			}
			
			// highlight target object
			if (event.target.id && event.target.id.substr(0, 7) == 'object_' && that.obj.node.id != event.target.id) {
				var newTargetObj = that.canvas.getObjectById(event.target.id.replace(/object_/, ''));
				
				if(newTargetObj != targetObj) {
					// if an old target object exists, restore old values
					restoreTargetObj();
					
					targetObj = newTargetObj;
					targetStrokeColor = targetObj.obj.attr('stroke');
					targetStrokeWidth = targetObj.obj.attr('stroke-width');
				}
				
				targetObj.obj.attr('stroke', 'red').attr('stroke-width', '2');
				
				// update path
				var targetBBox = targetObj.obj.getBBox();
				that.connectionPath.attr('path', vonline.Connection.computePath(bbox.x+bbox.width/2, bbox.y+bbox.height/2, targetBBox.x+targetBBox.width/2, targetBBox.y+targetBBox.height/2));
			}
			else {
				restoreTargetObj();
				
				// update path
				that.connectionPath.attr('path', vonline.Connection.computePath(bbox.x+bbox.width/2, bbox.y+bbox.height/2, event.offsetX, event.offsetY));
			}
		}
		$(this.connectionHandle.node).mousedown(function(event) {
			event.stopPropagation();
			$(window).bind('mousemove', connectionMoveEvent);
		});
		$(this.connectionHandle.node).click(function(event) {
			event.stopPropagation();
			
			that.canvas.selection.setConnectionMode(true);
			that.canvas.container.one('click', function(event) {
				$(window).unbind('mousemove', connectionMoveEvent);
				that.connectionPath.hide();
				restoreTargetObj(); // if a target object exists, restore old values
				
				that.canvas.selection.setConnectionMode(false);
				// abort if user clicks on canvas or the same object
				if (event.target.id && event.target.id.substr(0, 7) == 'object_' && that.obj.node.id != event.target.id) {
					// see vonline.Document
					vonline.events.trigger('drop', {type:'connection', connect: [that.obj.node.id.replace(/object_/, ''), event.target.id.replace(/object_/, '')]});
				}
			});
		});
	}
}

/**
 * show annotation handles
 */
vonline.Base.prototype.setAnnotationMode = function(active) {
	var that = this
	
	if(this.annotationHandle) {
		$(this.obj.node).unbind('changed', this.updateAnnotationHandle);
		this.annotationHandle.remove();
		this.annotationHandle = null;
	}
	if (active) {
		var bbox = this.obj.getBBox();
		this.updateAnnotationHandle = function() {
			if (that.annotationHandle) {
				var newBBox = that.obj.getBBox();
				that.annotationHandle.translate(newBBox.x - bbox.x + newBBox.width - bbox.width, newBBox.y - bbox.y + newBBox.height - bbox.height);
				that.annotationHandle.rotate(that.data.rotation, newBBox.x + newBBox.width/2, newBBox.y + newBBox.height/2);
				bbox = newBBox;
			}
		}
		$(this.obj.node).bind('changed', this.updateAnnotationHandle);
		
		// create connection handle
		this.annotationHandle = this.canvas.getPaper().image('images/canvas/annotate.png', 0, 0, 22, 22).attr('cursor', 'pointer');
		var handleBBox = this.annotationHandle.getBBox();
		this.annotationHandle.translate(bbox.x + bbox.width + 20, bbox.y - 10);
		this.annotationHandle.rotate(this.data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
		
		// handles events
		$(this.annotationHandle.node).mousedown(function(event) {
			event.stopPropagation();
		});
		$(this.annotationHandle.node).click(function(event) {
			event.stopPropagation();
			
			new vonline.InputDialog({text: 'Enter an annotation:', confirm: function(annotation) {
				if (annotation != '') {
					// see vonline.Document
					vonline.events.trigger('drop', {type:'annotation', text: annotation, connect: [that.data.id], x: that.data.width + 20, y: 0});
				}
			}});
		});
	}
}

/**
 * enables/disables the object text show/hide event
 */
vonline.Base.prototype.setTextMode = function(active) {
	var that = this
	
	if (this.inlineTextHandle) {
		$(this.obj.node).unbind('changed', this.updateInlineTextHandle);
		this.inlineTextHandle.remove();
		this.inlineTextHandle = null;
	}
	if (active) {
		var bbox = this.obj.getBBox();
		this.updateInlineTextHandle = function() {
			if (that.inlineTextHandle) {
				var newBBox = that.obj.getBBox();
				that.inlineTextHandle.translate(newBBox.x - bbox.x + newBBox.width - bbox.width, newBBox.y - bbox.y + newBBox.height - bbox.height);
				that.inlineTextHandle.rotate(that.data.rotation, newBBox.x + newBBox.width/2, newBBox.y + newBBox.height/2);
				bbox = newBBox;
			}
		}
		$(this.obj.node).bind('changed', this.updateInlineTextHandle);
		
		// create connection handle
		this.inlineTextHandle = this.canvas.getPaper().image('images/canvas/inline_text.png', 0, 0, 22, 22).attr('cursor', 'pointer');
		var handleBBox = this.inlineTextHandle.getBBox();
		this.inlineTextHandle.translate(bbox.x + bbox.width + 20, bbox.y + 14);
		this.inlineTextHandle.rotate(this.data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
		
		// handles events
		$(this.inlineTextHandle.node).mousedown(function(event) {
			event.stopPropagation();
		});
		$(this.inlineTextHandle.node).click(function(event) {
			event.stopPropagation();
			
			new vonline.InputDialog({text: 'Enter a new inline text:', confirm: function(inlinetext) {
				var command = new vonline.TextChangeCommand(that, inlinetext);
				command.execute();
				vonline.events.trigger('commandexec', command);
			}});
		});
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

/**
 * tests if an object with given id is connected to the current object
 * @param {vonline.Base} obj
 */
vonline.Base.prototype.isConnectedTo = function(obj) {
	for (var i = 0, len = this.data.connect.length; i < len; i++) {
		if (this.data.connect[i] == obj.getId()) {
			return true;
		}
	}
	return false;
}