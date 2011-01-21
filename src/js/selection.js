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
	
	$(window).bind('keyup', function(event) {
		// delete key pressed
		if (event.keyCode == 46) {
			var command = new vonline.DeleteCommand(canvas, that.data);
			command.execute();
			vonline.events.trigger('commandexec', command);
			
			that.clear();
		}
	});
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
	object.setSelection(true);
	object.setRotationMode(true);
	object.setConnectionMode(true);
	object.setAnnotationMode(true);
	object.setDragEventMode(this.resize, function() {
		that.updateResizeBox();
	});
	
	this.updateResizeBox();
}

/**
 * @param {vonline.Base} object
 */
vonline.Selection.prototype.remove = function(object) {
	this.data = $.without(this.data, object);
	this.resize = $.without(this.resize, object);
	var hold = $.without(this.obj, object.obj);
	this.obj = this.canvas.getPaper().set(hold);
	object.setSelection(false);
	object.setRotationMode(false);
	object.setConnectionMode(false);
	object.setAnnotationMode(false);
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
		).attr('stroke', 'blue').attr('stroke-width', 2);
		var handle = this.canvas.getPaper().path(this.handlePath).attr({fill: 'blue', stroke: 'none'}).hide();
		var handlebox = handle.getBBox();
		var angle = -this.data[0].data.rotation * Math.PI/180; 
		
		//
		var handlePositions = {
			w: { x: bbox.x - this.padding + handlebox.width/4, y: bbox.y + bbox.height/2 },
			o: { x: bbox.x + bbox.width + this.padding - handlebox.width/4, y: bbox.y + bbox.height/2 },
			n: { x: bbox.x + bbox.width/2, y: bbox.y - this.padding + handlebox.height/2 },
			s: { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height + this.padding - handlebox.height/2 },
		}
		// if only one object is selected, the resize box + handles will be rotated according to the object
		if(this.data.length == 1) {
			// rotate handles manually (-> compute rotated position on the resize box)
			var p = { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 };
			for(var h in handlePositions) {
				var tp = { x: handlePositions[h].x - p.x, y: -(handlePositions[h].y - p.y) };
				handlePositions[h].x = p.x + tp.x*Math.cos(angle) - tp.y*Math.sin(angle);
				handlePositions[h].y = p.y - (tp.x*Math.sin(angle) + tp.y*Math.cos(angle));
			}
		}
		
		this.handles = {
			w: handle.clone().translate(handlePositions['w'].x, handlePositions['w'].y).scale(.5, .5).attr('cursor', 'w-resize'),
			o: handle.clone().translate(handlePositions['o'].x, handlePositions['o'].y).scale(.5, .5).attr('cursor', 'e-resize'),
			n: handle.clone().translate(handlePositions['n'].x, handlePositions['n'].y).scale(.5, .5).rotate(90).attr('cursor', 'n-resize'),
			s: handle.clone().translate(handlePositions['s'].x, handlePositions['s'].y).scale(.5, .5).rotate(90).attr('cursor', 's-resize')
		}
		handle.remove();
		
		// rotate resize box and handles
		if(this.data.length == 1) {
			var rotDeg = this.data[0].data.rotation,
				rotOrigX = bbox.x + bbox.width/2,
				rotOrigY = bbox.y + bbox.height/2;
			this.resizeBox.rotate(rotDeg, rotOrigX, rotOrigY);
			this.handles['w'].rotate(rotDeg, true);
			this.handles['o'].rotate(rotDeg, true);
			this.handles['n'].rotate(rotDeg, true).rotate(90);
			this.handles['s'].rotate(rotDeg, true).rotate(90);
		}
		
		this.scaleInfo = this.canvas.getPaper().text(0, 0, "").attr('font-size', 16).attr('font-weight', 'bold').attr('fill', 'darkblue').hide();
		
		/** points for resizing (top-left and bottom-right) */
		var scalingPoints = {
			w: [bbox.x + bbox.width + this.padding / 2, bbox.y + bbox.height + this.padding / 2, bbox.x + bbox.width, bbox.y + bbox.height],
			o: [bbox.x - this.padding / 2, bbox.y - this.padding / 2, bbox.x, bbox.y],
			n: [bbox.x + bbox.width + this.padding / 2, bbox.y + bbox.height + this.padding / 2, bbox.x + bbox.width, bbox.y + bbox.height],
			s: [bbox.x - this.padding / 2, bbox.y - this.padding / 2, bbox.x, bbox.y]
		};
		
		/** Handles the resize of the resizeBox via the handles */
		function handleResize(direction) {
			$(that.handles[direction].node).mousedown(function(event) {
				// prevent selecting text
				event.preventDefault();
				event.stopPropagation();
				
				// disable connection/annotation mode (icons)
				for(var i = 0; i < that.data.length; i++) {
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
					scaleDirection = direction;
				var moveEvent = function(event) {
					event.preventDefault();
					event.stopPropagation();
					
					that.handles[direction].attr({fill: '#3BB9FF'});
					
					// compute delta
					var delta, normal_vec;
					if(singleObject) {
						// if singleObject: object rotation has to be unset before we scale the object (otherwise the object will be rotated around the new center)
						that.obj.rotate(0, true);
						that.resizeBox.rotate(0, true);
						
						// no, i'm not going to create ascii art for this
						var delta_vec = { x: (event.pageX - origX), y: -(event.pageY - origY) };
						var line_vec = { x: -Math.sin(angle), y: Math.cos(angle) }; // "zero"/origin line
						var normal_vec = { x: Math.cos(angle), y: Math.sin(angle) }; // normal from the line
						
						// swap line/normal vector for north/south scale
						if(direction == 'n' || direction == 's') {
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
						var delta_vec_len = Math.sqrt(delta_vec.x*delta_vec.x + delta_vec.y*delta_vec.y);
						delta_vec.x /= delta_vec_len;
						delta_vec.y /= delta_vec_len;
						var side = (delta_vec.x*normal_vec.x + delta_vec.y*normal_vec.y) < 0 ? -1 : 1;
						delta *= side;
					}
					else {
						// if multiple objects are selected, the resize box isn't rotated, so the delta is simply the x or y distance
						switch (direction) {
							case 'w':
							case 'o':
								delta = (event.pageX - origX);
								normal_vec = { x: 1, y: 0 };
								break;
							case 'n':
							case 's':
								delta = -(event.pageY - origY);
								normal_vec = { x: 0, y: 1 };
								break;
						}
					}
					
					// finally: scale
					switch (direction) {
						case 'w':
							delta = -delta;
							normal_vec = { x: -normal_vec.x, y: -normal_vec.y };
						case 'o':
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
					}
					
					if(singleObject) {
						// if singleObject: reset rotation again
						that.obj.rotate(that.data[0].data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
						that.resizeBox.rotate(that.data[0].data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
					}
					
					// reposition handle
					var hbbox = that.handles[direction].getBBox();
					that.handles[direction].translate(-hbbox.x-hbbox.width/2, -hbbox.y-hbbox.height/2); // undo current translation
					that.handles[direction].translate(handlePositions[direction].x + normal_vec.x*delta, handlePositions[direction].y - normal_vec.y*delta);
					
					// update scale info and reposition
					that.scaleInfo.attr({
						text: Math.round((scaleX != 1 ? scaleX : scaleY)*100)/100+'x',
						x: handlePositions[direction].x + normal_vec.x*(delta+30),
						y: handlePositions[direction].y - normal_vec.y*(delta+30)
					});
					
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
					for(var i = 0; i < that.data.length; i++) {
						that.data[i].setRotationMode(true);
						that.data[i].setConnectionMode(true);
						that.data[i].setAnnotationMode(true);
						that.data[i].setTextMode(true);
						$(that.data[i].obj.node).trigger('changed');
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
		
		handleResize('o');
		handleResize('w');
		handleResize('n');
		handleResize('s');
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
