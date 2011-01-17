/**
 * @namespace
 */
vonline.Selection = function(canvas) {
	this.canvas = canvas;
	this.data = [];
	this.obj = canvas.getPaper().set();
	this.padding = 20;
	this.resizeBox = null;
	this.handlePath = 'M0,10 L10,0 L10,5 L30,5 L30,0 L40,10 L30,20 L30,15 L10,15 L10,20z';
	
	var that = this;
	vonline.events.bind('canvaschanged', function() {
		that.updateResizeBox();
	});
}

/**
 * @param {vonline.Base} object
 */
vonline.Selection.prototype.add = function(object) {
	this.data.push(object);
	this.obj.push(object.obj);
	object.setRotationMode(true);
	
	this.updateResizeBox();
}

/**
 * @param {vonline.Base} object
 */
vonline.Selection.prototype.remove = function(object) {
	this.data = $.grep(this.data, function(obj) {
		return obj != object;
	});
	var hold = $.grep(this.obj, function(obj) {
		return obj != object.obj;
	});
	this.obj = this.canvas.getPaper().set(hold);
	object.setRotationMode(false);

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
	}
	if (this.data.length > 0) {
		this.resizeBox = this.canvas.getPaper().rect(
			bbox.x - this.padding / 2,
			bbox.y - this.padding / 2,
			bbox.width + this.padding,
			bbox.height + this.padding
		).attr('stroke', 'blue').attr('stroke-width', 2);
		var handle = this.canvas.getPaper().path(this.handlePath).translate(bbox.x, bbox.y).scale(.5, .5, bbox.x, bbox.y).attr({fill: 'blue', stroke: 'none'}).hide();
		var handlebox = handle.getBBox();
		
		this.handles = {
			w: handle.clone().translate(-this.padding, bbox.height / 2 - handlebox.height / 2),
			o: handle.clone().translate(bbox.width + this.padding - handlebox.width, bbox.height / 2 - handlebox.height / 2),
			n: handle.clone().translate(bbox.width / 2 - handlebox.width / 2, -this.padding + handlebox.height / 2).rotate(90),
			s: handle.clone().translate(bbox.width / 2 - handlebox.width / 2, bbox.height + handlebox.height / 2).rotate(90)
		}
		handle.remove();
		
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
				
				var origX = x = event.pageX,
					origY = y = event.pageY,
					scaleX = scaleY = 1,
					scaleFromX = scaleFromY = 0;
				var moveEvent = function(event) {
					event.preventDefault();
					event.stopPropagation();
					
					that.handles[direction].attr({fill: '#3BB9FF'});
					
					var delta = null;
					switch (direction) {
					case 'w':
						delta = -(event.pageX - origX);
					case 'o':
						delta = !delta ? (event.pageX - origX) : delta;
						
						that.resizeBox.scale(1 + delta / (bbox.width + that.padding), 1, scalingPoints[direction][0], scalingPoints[direction][1]);
						
						// object rotation has to be reset before we scale the object (otherwise the object will be rotated around the new center)
						that.obj.rotate(0, true);
						that.obj.scale(1 + delta / bbox.width, 1, scalingPoints[direction][2], scalingPoints[direction][3]);
						that.obj.rotate(that.data[0].data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
						
						that.handles[direction].translate(event.pageX - x, 0);
						
						scaleX = 1 + delta / bbox.width;
						scaleFromX = scalingPoints[direction][2];
						scaleFromY = scalingPoints[direction][3];
						break;
					case 'n':
						delta = -(event.pageY - origY);
					case 's':
						delta = !delta ? (event.pageY - origY) : delta;
						
						that.resizeBox.scale(1, 1 + delta / (bbox.height + that.padding), scalingPoints[direction][0], scalingPoints[direction][1]);
						
						// see above
						that.obj.rotate(0, true);
						that.obj.scale(1, 1 + delta / bbox.height, scalingPoints[direction][2], scalingPoints[direction][3]);
						that.obj.rotate(that.data[0].data.rotation, bbox.x + bbox.width/2, bbox.y + bbox.height/2);
						
						that.handles[direction].translate(0, event.pageY - y);
						
						scaleY = 1 + delta / bbox.height;
						scaleFromX = scalingPoints[direction][2];
						scaleFromY = scalingPoints[direction][3];
						break;
					}
					x = event.pageX;
					y = event.pageY;
				} 
				$(window).mousemove(moveEvent);
				$(window).one('mouseup', function(event) {
					event.preventDefault();
					event.stopPropagation();
					
					$(window).unbind('mousemove', moveEvent);
					
					var command = new vonline.ScaleCommand(that.data, scaleX, scaleY, scaleFromX, scaleFromY);
					command.execute();
					vonline.events.trigger('commandexec', command);
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