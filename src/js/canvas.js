/**
 * Class for managing the svg elements
 * @namespace
 */
vonline.Canvas = function() {
	var that = this;
	this.container = $('#canvas');
	this.paper = Raphael('canvas', this.container.width(), this.container.height()).initZoom();
	this.objects = [];
	this.maxId = 0;
	this.selection = new vonline.Selection(this);
	this.offset = {x:0, y:0};
	this.viewport = {width:0, height:0}
	this.zoom = 1.0;
	this.initRectangleSelection();
	this.initDragging();
	
	function onResize() {
		var sidebarwidth = $('#sidebar').width(),
		documentwidth = ($(window).width() - that.offset.x) * 1.5,
		documentheight = ($(window).height() - that.offset.y) * 1.5;
		that.viewport.width = $(window).width() - sidebarwidth;
		that.viewport.height = $(window).height();
		that.container.css({width: (documentwidth-sidebarwidth)+'px', height: documentheight + 'px', marginLeft: sidebarwidth+'px'});
		that.paper.setSize(that.container.width(), that.container.height());
	}
	$(window).bind('resize', onResize);
}

vonline.Canvas.prototype.getObjects = function() {
	return this.objects;
}

/**
 * loads a document from its json representation
 * @param {array} json array containing the components
 * @exmaple
 * vonline.document.canvas.load([{type:'rectangle', id:1, scaleX:1, scaleY:1, x: 100, y:50}]);
 */
vonline.Canvas.prototype.load = function(json) {
	
	this.clear();
	
	for (var i = 0, count = json.length; i < count; i++) {
		var object = this.createObject(json[i]);
		if (object.data.id > this.maxId) {
			this.maxId = object.data.id;
		}
		this.add(object);
	}
}

vonline.Canvas.prototype.createObject = function(data) {
	switch (data.type) {
	case 'rectangle':
		return new vonline.Rectangle(data);
	break;
	case 'connection':
		return new vonline.Connection(data);
	break;
	case 'annotation':
		return new vonline.Annotation(data);
	break;
	case 'path':
		return new vonline.Path(data);
	break;
	}
}

/**
 * @param {vonline.Base} obj
 */
vonline.Canvas.prototype.add = function(obj) {
	if (!obj.data.id) {
		obj.data.id = ++this.maxId;
	}
	obj.setCanvas(this);
	this.objects.push(obj);
}

/**
 * @param {vonline.Base} obj
 */
vonline.Canvas.prototype.remove = function(obj) {
	obj.setCanvas(null);
	this.objects = $.grep(this.objects, function(object) {
		return object != obj;
	});
}

/**
 * Deletes all object from canvas
 */
vonline.Canvas.prototype.clear = function() {
	this.selection.clear();
	for (var i = this.objects.length - 1; i >= 0; i--) {
		this.remove(this.objects[i]);
	}
}

vonline.Canvas.prototype.getPaper = function() {
	return this.paper;
}

/**
 * @param {number} id
 * @return {vonline.Base} object
 */
vonline.Canvas.prototype.getObjectById = function(id) {
	for (var i = 0, len = this.objects.length; i < len; i++) {
		if (this.objects[i].getId() == id) {
			return this.objects[i];
		}
	}
	return null;
}

vonline.Canvas.prototype.exportJSON = function() {
	var json = [];
	for (var i = 0, count = this.objects.length; i < count; i++) {
		json.push(this.objects[i].toJSON());
	}
	return json;
}

vonline.Canvas.prototype.initRectangleSelection = function() {
	var that = this;
	this.container.mousedown(function(event) {
		event.preventDefault();
		if (event.which == 3) {
			return;
		}
		event = that.normalizeEvent(event);
		var x = event.offsetX,
			y = event.offsetY,
			rect = that.paper.rect(x, y).attr({stroke: 'blue', fill: 'rgba(0,100,255,.5)'});
		
		var moveEvent = function(event) {
			event = that.normalizeEvent(event);
			var width = (event.offsetX - x),
				height = (event.offsetY - y);
			if (width < 0) {
				rect.attr('width', -width);
				rect.attr('x', event.offsetX);
			}
			else {
				rect.attr('width', width);
				rect.attr('x', x);
			}
			if (height < 0) {
				rect.attr('height', -height);
				rect.attr('y', event.offsetY);
			}
			else {
				rect.attr('height', height);
				rect.attr('y', y);
			}
		}
		that.container.mousemove(moveEvent);
		
		that.container.one('mouseup', function(event) {
			that.container.unbind('mousemove', moveEvent);
			
			if (!event.shiftKey) {
				that.selection.clear();
			}
			
			var bbox = rect.getBBox();
			rect.remove();
			for (var i = 0, count = that.objects.length; i < count; i++) {
				if (that.objects[i].fitsIn(bbox)) {
					that.selection.add(that.objects[i]);
				}
			}
		})
	});
}

/**
 * normalizes the event.offsetX and event.offsetY value
 */
vonline.Canvas.prototype.normalizeEvent = function(event) {
	var offset = this.container.offset();
	if (!event.offsetX) {
		event.offsetX = event.pageX - offset.left;
	}
	if (!event.offsetY) {
		event.offsetY = event.pageY - offset.top;
	}
	return event;
}

vonline.Canvas.prototype.initDragging = function() {
	var that = this;
	this.container.bind('contextmenu', function(event) {
		event.preventDefault();
	});
	this.container.mousedown(function(event) {
		event.preventDefault();
		if (event.which != 3) {
			return;
		}
		var x = event.pageX,
		y = event.pageY,
		deltaX = 0,
		deltaY = 0;
		
		var moveEvent = function(event) {
			that.container.css('cursor', 'move');
			deltaX = x - event.pageX;
			deltaY = y - event.pageY;
			that.container.css({
				left: (that.offset.x - deltaX) >= 0 ? 0 : (that.offset.x - deltaX) + 'px',
				top: (that.offset.y - deltaY) >= 0 ? 0 : (that.offset.y - deltaY) + 'px'
			});
		}
		that.container.mousemove(moveEvent);
		
		that.container.one('mouseup', function(event) {
			that.container.unbind('mousemove', moveEvent);
			that.container.css('cursor', 'auto');
			
			that.setOffset(that.offset.x - deltaX, that.offset.y - deltaY);
			
			$(window).trigger('resize');
		})
	});
}

vonline.Canvas.prototype.setOffset = function(x, y) {
	x = x >= 0 ? 0 : x;
	y = y >= 0 ? 0 : y
	this.container.css({
		left: x + 'px',
		top: y + 'px'
	});
	this.offset.x = x;
	this.offset.y = y;
}

vonline.Canvas.prototype.setZoom = function(zoom) {
	if (zoom == 'fit') {
		this.paper.setZoom(1);
		var objects = this.objects;
		var tofit = [];
		$.each(objects, function(i, obj) {
			tofit.push(obj.obj);
		});
		tofit = this.paper.set(tofit);
		tofit = tofit.getBBox();
		zoom = Math.min(this.viewport.width / (tofit.width + 25), this.viewport.height / (tofit.height + 25));
		this.paper.setZoom(zoom);
		this.setOffset(-(tofit.x-10) * zoom, -(tofit.y-10) * zoom);
		$(window).trigger('resize');
		return;
	}
	this.paper.setZoom(zoom);
	
	var delta = zoom / this.zoom;
	if (delta > 1) {
		this.setOffset(
			this.offset.x * delta - this.viewport.width / delta,
			this.offset.y * delta - this.viewport.height / delta
		);
	}
	else if (delta < 1) {
		this.setOffset(
			(this.offset.x + this.viewport.width * delta) * delta,
			(this.offset.y + this.viewport.height * delta) * delta
		);
	}
	
	this.zoom = zoom;
	$(window).trigger('resize');
}

vonline.Canvas.prototype.getZoom = function() {
	return this.zoom;
}