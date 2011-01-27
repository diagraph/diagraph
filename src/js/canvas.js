/**
 * Class for managing the svg elements
 * @namespace
 */
vonline.Canvas = function() {
	var that = this;
	this.container = $('#canvas');
	this.paper = Raphael('canvas', this.container.width(), this.container.height());
	this.objects = [];
	this.maxId = 0;
	this.selection = new vonline.Selection(this);
	this.initRectangleSelection();
	
	function onResize() {
		var sidebarwidth = $('#sidebar').width(),
			documentwidth = $(window).width();
		that.container.css({width: (documentwidth-sidebarwidth)+'px', marginLeft: sidebarwidth+'px'});
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