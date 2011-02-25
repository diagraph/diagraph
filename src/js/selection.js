/**
 * @namespace
 */
vonline.Selection = function(canvas) {
	this.canvas = canvas;
	this.data = [];
	this.resize = [];
	this.obj = canvas.getPaper().set();
	this.padding = 20;
	this.resizeBox = null;
	this.handlePath = 'M-20,0 L-10,-10 L-10,-5 L10,-5 L10,-10 L20,0 L10,10 L10,5 L-10,5 L-10,10z';
	
	var that = this;
	vonline.events.bind('canvaschanged', function() {
		that.updateResizeBox();
	});
	vonline.events.bind('zoom', function() {
		that.updateResizeBox();
	});
	
	function deleteObjFunc(event) {
		if ($('input:focus').length) {
			return;
		}
		// delete or backspace key pressed
		if (event.keyCode == 46 || event.keyCode == 8) {
			// also: prevent browser from navigating backwards
			event.preventDefault();
			event.stopPropagation();
			
			var command = new vonline.DeleteCommand(canvas, that.data);
			command.execute();
			vonline.events.trigger('commandexec', command);
			
			that.clear();
		}
	};
	// bind to keypress and keydown for compatibility reasons
	$(window).bind('keypress', deleteObjFunc);
	$(window).bind('keydown', deleteObjFunc);
}

/**
 * @param {vonline.Base} object
 */
vonline.Selection.prototype.add = function(object) {
	var that = this;
	this.data.push(object);
	if (object.isResizeable()) {
		this.obj.push(object.obj);
		this.resize.push(object);
	}
	
	object.setSelection(true, this.resize.length);
	object.setDragEventMode(this.resize, function() {
		that.updateResizeBox();
	});
	
	this.updateResizeBox();
	
	vonline.events.trigger('selection_changed', this.resize.length);
}

/**
 * @param {vonline.Base} object
 */
vonline.Selection.prototype.remove = function(object) {
	this.data = $.without(this.data, object);
	this.resize = $.without(this.resize, object);
	var hold = $.without(this.obj, object.obj);
	this.obj = this.canvas.getPaper().set(hold);
	
	vonline.events.trigger('selection_changed', this.resize.length);
	
	object.setSelection(false);
	object.setDragEventMode(object);
	
	for (var i = 0, len = this.data.length; i < len; i++) {
		this.data[i].setDragEventMode(this.resize);
	}

	this.updateResizeBox();
}

/**
 * @param {vonline.Base} object
 */
vonline.Selection.prototype.toggle = function(object) {
	if ($.inArray(object, this.data) != -1) {
		this.remove(object);
	}
	else {
		this.add(object);
	}
}

vonline.Selection.prototype.clear = function() {
	for (var i = this.data.length - 1; i >= 0; i--) {
		this.remove(this.data[i]);
	}
}

/**
 * creates the resize-box and handles resizing
 * <br/><strong>Needs refactoring!</strong>
 */
vonline.Selection.prototype.updateResizeBox = function() {
	var bbox = this.obj.getBBox(),
	that = this;
	
	if (this.resizeBox) {
		this.resizeBox.remove();
		for (var e in this.handles) {
			this.handles[e].remove();
		}
		this.scaleInfo.remove();
	}
	if (this.resize.length > 0) {
		this.resizeBox = this.canvas.getPaper().rect(
			bbox.x - this.padding / 2,
			bbox.y - this.padding / 2,
			bbox.width + this.padding,
			bbox.height + this.padding
		).attr('stroke', 'blue').attr('stroke-width', 1);
		var handle = this.canvas.getPaper().path(this.handlePath).attr({fill: 'blue', stroke: 'none'}).hide();
		var handlebox = handle.getBBox();
		var angle = -this.data[0].data.rotation * Math.PI/180; 
		
		//
		var handlePositions = {
			nw: { x: bbox.x - this.padding + handlebox.width/3, y: bbox.y - this.padding + handlebox.height/1.5 },
			n: { x: bbox.x + bbox.width/2, y: bbox.y - this.padding + handlebox.height/2 },
			ne: { x: bbox.x + bbox.width + this.padding - handlebox.width/3, y: bbox.y - this.padding + handlebox.height/1.5 },
			e: { x: bbox.x + bbox.width + this.padding - handlebox.width/4, y: bbox.y + bbox.height/2 },
			se: { x: bbox.x + bbox.width + this.padding - handlebox.width/3, y: bbox.y + bbox.height + this.padding - handlebox.height/1.5 },
			s: { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height + this.padding - handlebox.height/2 },
			sw: { x: bbox.x - this.padding + handlebox.width/3, y: bbox.y + bbox.height + this.padding - handlebox.height/1.5},
			w: { x: bbox.x - this.padding + handlebox.width/4, y: bbox.y + bbox.height/2 }
		}
		// if only one object is selected, the resize box + handles will be rotated according to the object
		if (this.data.length == 1) {
			// rotate handles manually (-> compute rotated position on the resize box)
			var p = { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 };
			for (var h in handlePositions) {
				var tp = { x: handlePositions[h].x - p.x, y: -(handlePositions[h].y - p.y) };
				handlePositions[h].x = p.x + tp.x*Math.cos(angle) - tp.y*Math.sin(angle);
				handlePositions[h].y = p.y - (tp.x*Math.sin(angle) + tp.y*Math.cos(angle));
			}
		}
		
		this.handles = {
			nw: handle.clone().translate(handlePositions.nw.x, handlePositions.nw.y).scale(.5, .5).rotate(45).attr('cursor', 'nw-resize'),
			n: handle.clone().translate(handlePositions.n.x, handlePositions.n.y).scale(.5, .5).rotate(90).attr('cursor', 'n-resize'),
			ne: handle.clone().translate(handlePositions.ne.x, handlePositions.ne.y).scale(.5, .5).rotate(-45).attr('cursor', 'ne-resize'),
			e: handle.clone().translate(handlePositions.e.x, handlePositions.e.y).scale(.5, .5).attr('cursor', 'e-resize'),
			se: handle.clone().translate(handlePositions.se.x, handlePositions.se.y).scale(.5, .5).rotate(45).attr('cursor', 'se-resize'),
			s: handle.clone().translate(handlePositions.s.x, handlePositions.s.y).scale(.5, .5).rotate(90).attr('cursor', 's-resize'),
			sw: handle.clone().translate(handlePositions.sw.x, handlePositions.sw.y).scale(.5, .5).rotate(-45).attr('cursor', 'sw-resize'),
			w: handle.clone().translate(handlePositions.w.x, handlePositions.w.y).scale(.5, .5).attr('cursor', 'w-resize')
		}
		handle.remove();
		
		// rotate resize box and handles
		if (this.data.length == 1) {
			var rotDeg = this.data[0].data.rotation,
			rotOrigX = bbox.x + bbox.width/2,
			rotOrigY = bbox.y + bbox.height/2;
			this.resizeBox.rotate(rotDeg, rotOrigX, rotOrigY);
			this.handles.w.rotate(rotDeg, true);
			this.handles.e.rotate(rotDeg, true);
			this.handles.n.rotate(rotDeg, true).rotate(90);
			this.handles.s.rotate(rotDeg, true).rotate(90);
			this.handles.nw.rotate(rotDeg, true).rotate(45);
			this.handles.se.rotate(rotDeg, true).rotate(45);
			this.handles.ne.rotate(rotDeg, true).rotate(-45);
			this.handles.sw.rotate(rotDeg, true).rotate(-45);
		}
		
		this.scaleInfo = this.canvas.getPaper().text(0, 0, "").attr('font-size', 16).attr('font-weight', 'bold').attr('fill', 'darkblue').hide();
		
		/** points for resizing */
		var scalingPoints = {
			// bottom-right
			nw: [bbox.x + bbox.width + this.padding / 2, bbox.y + bbox.height + this.padding / 2, bbox.x + bbox.width, bbox.y + bbox.height],
			n: [bbox.x + bbox.width + this.padding / 2, bbox.y + bbox.height + this.padding / 2, bbox.x + bbox.width, bbox.y + bbox.height],
			// bottom-left
			ne: [bbox.x - this.padding / 2, bbox.y + bbox.height + this.padding / 2,  bbox.x, bbox.y + bbox.height],
			// top-left
			e: [bbox.x - this.padding / 2, bbox.y - this.padding / 2, bbox.x, bbox.y],
			se: [bbox.x - this.padding / 2, bbox.y - this.padding / 2, bbox.x, bbox.y],
			// top-left
			s: [bbox.x - this.padding / 2, bbox.y - this.padding / 2, bbox.x, bbox.y],
			// top-right
			sw:[bbox.x + bbox.width + this.padding / 2, bbox.y - this.padding / 2, bbox.x + bbox.width, bbox.y],
			// bottom-right
			w: [bbox.x + bbox.width + this.padding / 2, bbox.y + bbox.height + this.padding / 2, bbox.x + bbox.width, bbox.y + bbox.height]
		};
		
		/** Handles the resize of the resizeBox via the handles */
		function handleResize(direction) {
			$(that.handles[direction].node).mousedown(function(event) {
				// prevent selecting text
				event.preventDefault();
				event.stopPropagation();
				
				for (var dir in that.handles) {
					if (dir != direction) {
						that.handles[dir].hide();
					}
				}
				
				// disable connection/annotation mode (icons)
				for (var i = 0; i < that.data.length; i++) {
					that.data[i].setRotationMode(false);
					that.data[i].setConnectionMode(false);
					that.data[i].setAnnotationMode(false);
					that.data[i].setTextMode(false);
				}
				that.scaleInfo.show();
								
				var origX = x = event.pageX,
				origY = y = event.pageY,
				scaleX = scaleY = 1,
				scaleFromX = scaleFromY = 0,
				singleObject = (that.data.length == 1),
				scaleDirection = direction,
				moveEvent = function(event) {
					event.preventDefault();
					event.stopPropagation();
					
					that.handles[direction].attr({fill: '#3BB9FF'});
					
					// compute delta
					var delta, normal_vec, deltaX, deltaY;
					if (singleObject) {
						// if singleObject: object rotation has to be unset before we scale the object (otherwise the object will be rotated around the new center)
						that.obj.rotate(0, true);
						that.resizeBox.rotate(0, true);
						
						// no, i'm not going to create ascii art for this
						var delta_vec = { x: (event.pageX - origX), y: -(event.pageY - origY) };
						var line_vec = { x: -Math.sin(angle), y: Math.cos(angle) }; // "zero"/origin line
						var normal_vec = { x: Math.cos(angle), y: Math.sin(angle) }; // normal from the line
						
						// swap line/normal vector for north/south scale
						if (direction == 'n' || direction == 's') {
							var tmp = line_vec;
							line_vec = normal_vec;
							normal_vec = tmp;
						}
						
						// project delta vector onto line vector and compute the distance
						var proj_len = (delta_vec.x * line_vec.x + delta_vec.y * line_vec.y);
						var proj_vec = { x: proj_len*line_vec.x, y: proj_len*line_vec.y };
						var dist_vec = { x: delta_vec.x-proj_vec.x, y: delta_vec.y-proj_vec.y };
						delta = Math.sqrt(dist_vec.x*dist_vec.x + dist_vec.y*dist_vec.y);
						
						// normalize delta vector, compute on which side we're on and multiply with delta
						var norm_delta_vec = vonline.vector.normalize(delta_vec);
						var side = (norm_delta_vec.x*normal_vec.x + norm_delta_vec.y*normal_vec.y) < 0 ? -1 : 1;
						delta *= side;
						if (direction.length == 2) {
							deltaX = delta;
							
							// project delta vector onto line vector and compute the distance
							var proj_len = (delta_vec.x * normal_vec.x + delta_vec.y * normal_vec.y);
							var proj_vec = { x: proj_len*normal_vec.x, y: proj_len*normal_vec.y };
							var dist_vec = { x: delta_vec.x-proj_vec.x, y: delta_vec.y-proj_vec.y };
							deltaY = Math.sqrt(dist_vec.x*dist_vec.x + dist_vec.y*dist_vec.y);
							
							// normalize delta vector, compute on which side we're on and multiply with delta
							var side = (norm_delta_vec.x*line_vec.x + norm_delta_vec.y*line_vec.y) < 0 ? -1 : 1;
							deltaY *= side;
							delta = 1;
							normal_vec = delta_vec;
							if (direction == 'se' || direction == 'nw') {
								deltaX = -deltaX;
							}
						}
					}
					else {
						// if multiple objects are selected, the resize box isn't rotated, so the delta is simply the x or y distance
						switch (direction) {
							case 'w':
							case 'e':
								delta = (event.pageX - origX);
								normal_vec = { x: 1, y: 0 };
								break;
							case 'n':
							case 's':
								delta = -(event.pageY - origY);
								normal_vec = { x: 0, y: 1 };
								break;
							case 'ne':
							case 'sw':
								deltaX = (event.pageX - origX);
								deltaY = -(event.pageY - origY);
								normal_vec = { x: deltaX, y: deltaY };
								delta = 1;
								break;
							case 'nw':
							case 'se':
								deltaX = -(event.pageX - origX);
								deltaY = -(event.pageY - origY);
								normal_vec = { x: -deltaX, y: deltaY };
								delta = 1;
								break;
						}
					}
					
					// finally: scale
					switch (direction) {
						case 'w':
							delta = -delta;
							normal_vec = { x: -normal_vec.x, y: -normal_vec.y };
						case 'e':
							that.resizeBox.scale(1 + delta / (bbox.width + that.padding), 1, scalingPoints[direction][0], scalingPoints[direction][1]);
							that.obj.scale(1 + delta / bbox.width, 1, scalingPoints[direction][2], scalingPoints[direction][3]);						
							scaleX = 1 + delta / bbox.width;
							break;
						case 's':
							delta = -delta;
							normal_vec = { x: -normal_vec.x, y: -normal_vec.y };
						case 'n':
							that.resizeBox.scale(1, 1 + delta / (bbox.height + that.padding), scalingPoints[direction][0], scalingPoints[direction][1]);
							that.obj.scale(1, 1 + delta / bbox.height, scalingPoints[direction][2], scalingPoints[direction][3]);
							scaleY = 1 + delta / bbox.height;
							break;
						case 'sw':
							delta = -delta;
							deltaX = -deltaX;
							deltaY = -deltaY;
							normal_vec = { x: -normal_vec.x, y: -normal_vec.y };
						case 'ne':
							that.resizeBox.scale(1 + deltaX / (bbox.width + that.padding), 1 + deltaY / (bbox.height + that.padding), scalingPoints[direction][0], scalingPoints[direction][1]);
							that.obj.scale(1 + deltaX / bbox.width, 1 + deltaY / bbox.height, scalingPoints[direction][2], scalingPoints[direction][3]);						
							scaleX = 1 + deltaX / bbox.width;
							scaleY = 1 + deltaY / bbox.height;
							break;
						case 'se':
							delta = -delta;
							deltaX = -deltaX;
							deltaY = -deltaY;
							normal_vec = { x: -normal_vec.x, y: -normal_vec.y };
						case 'nw':
							that.resizeBox.scale(1 + deltaX / (bbox.width + that.padding), 1 + deltaY / (bbox.height + that.padding), scalingPoints[direction][0], scalingPoints[direction][1]);
							that.obj.scale(1 + deltaX / bbox.width, 1 + deltaY / bbox.height, scalingPoints[direction][2], scalingPoints[direction][3]);						
							scaleX = 1 + deltaX / bbox.width;
							scaleY = 1 + deltaY / bbox.height;
							break;
					}
					
					if (singleObject) {
						// if singleObject: reset rotation again
						that.obj.rotate(that.data[0].data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
						that.resizeBox.rotate(that.data[0].data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
					}
					// reposition handle
					var hbbox = that.handles[direction].getBBox();
					that.handles[direction].translate(-hbbox.x-hbbox.width/2, -hbbox.y-hbbox.height/2); // undo current translation
					console.log(normal_vec.x * delta, normal_vec.y*delta);
					that.handles[direction].translate(handlePositions[direction].x + normal_vec.x*delta, handlePositions[direction].y - normal_vec.y*delta);
					
					// update scale info and reposition
					if (delta != 1 && delta != -1) {
						that.scaleInfo.attr({
							text: Math.round((scaleX != 1 ? scaleX : scaleY)*100)/100+'x',
							x: handlePositions[direction].x + normal_vec.x*(delta+30),
							y: handlePositions[direction].y - normal_vec.y*(delta+30)
						});
					}
					else {
						that.scaleInfo.hide();
					}
					
					scaleFromX = scalingPoints[direction][2];
					scaleFromY = scalingPoints[direction][3];
					x = event.pageX;
					y = event.pageY;
				}
				$(window).mousemove(moveEvent);
				$(window).one('mouseup', function(event) {
					event.preventDefault();
					event.stopPropagation();
					
					$(window).unbind('mousemove', moveEvent);
					
					var command = new vonline.ScaleCommand(that.data, scaleX, scaleY, scaleFromX, scaleFromY, scaleDirection);
					command.execute();
					vonline.events.trigger('commandexec', command);
					
					// reenable connection/annotation mode
					for (var i = 0; i < that.data.length; i++) {
						$(that.data[i].obj.node).trigger('changed');
					}
					if (that.data.length == 1) {
						that.data[0].setRotationMode(true);
						that.data[0].setConnectionMode(true);
						that.data[0].setAnnotationMode(true);
						that.data[0].setTextMode(true);
					}
					that.scaleInfo.hide();
				});
			})
			.mouseover(function(event) {
				that.handles[direction].attr({fill: '#3BB9FF'});
			})
			.mouseout(function(event) {
				that.handles[direction].attr({fill: 'blue'});
			});
		}
		
		handleResize('e');
		handleResize('w');
		handleResize('n');
		handleResize('s');
		handleResize('ne');
		handleResize('sw');
		handleResize('nw');
		handleResize('se');
	}	
}

/**
 * hides the resize/rotation handles and handles clicks
 * @param {boolean} active
 */
vonline.Selection.prototype.setConnectionMode = function(active) {
	if (active) {
		this.setSelectionMode(active);
		$.each(this.data, function(i, object) {
			object.setRotationMode(false);
			object.setConnectionMode(false);
			object.setAnnotationMode(false);
		});
		$.each(this.canvas.objects, function(i, object) {
			object.setClickEventMode(false);
		});
	}
	else {
		this.setSelectionMode(active);
		$.each(this.data, function(i, object) {
			object.setRotationMode(true);
			object.setConnectionMode(true);
			object.setAnnotationMode(true);
		});
		$.each(this.canvas.objects, function(i, object) {
			object.setClickEventMode(true);
		});
	}
}

/**
 * hides the resize box and resize handles
 * @param {boolean} active
 */
vonline.Selection.prototype.setSelectionMode = function(active) {
	if (active) {
		if (this.resizeBox) {
			this.resizeBox.show();
			for (var e in this.handles) {
				this.handles[e].show();
			}
		}
	}
	else {
		if (this.resizeBox) {
			this.resizeBox.hide();
			for (var e in this.handles) {
				this.handles[e].hide();
			}
		}
	}
}
