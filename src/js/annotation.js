/**
 * @namespace
 * @augments vonline.Base
 */
vonline.Annotation = function(data) {
	// inherit default values
	this.data = $.extend({}, this.data, data);
	this.resizeable = false;
}

vonline.Annotation.prototype = new vonline.Base();

vonline.Annotation.prototype.createObjectId = function() {
	return 'annotation_'+this.data.id;
}

/**
 * Creates the object on the given canvas
 * @param {vonline.Canvas} canvas
 */
vonline.Annotation.prototype.createObject = function(canvas) {
	var that = this;
	
	this.sourceObject = canvas.getObjectById(this.data.connect[0]);
	var bbox = this.sourceObject.obj.getBBox();
	
	// event handler
	$(this.sourceObject.obj.node).bind('changed', function() {
		that.updateLayout();
	});
	var obj = canvas.getPaper().rect(bbox.x + this.data.x, bbox.y + this.data.y, 100, 15).attr('stroke-dasharray', '--').attr('fill', 'rgba(255,255,255,0.7)');
	
	$(obj.node).bind('textchanged', function() {
		that.updateLayout();
	});
	
	$(obj.node).dblclick(function(event) {
		event.stopPropagation();
		
		new vonline.InputDialog({text: 'Enter a new inline text:', confirm: function(inlinetext) {
			var command = new vonline.TextChangeCommand(that, inlinetext);
			command.execute();
			vonline.events.trigger('commandexec', command);
		}});
	});
	
	return obj;
}

vonline.Annotation.prototype.updateLayout = function() {
	var textwidth = Math.ceil(this.text.getBBox().width);
	this.obj.attr('width', textwidth + 10);
	this.setPosition(this.data.x, this.data.y);
}

vonline.Annotation.prototype.setPosition = function(x, y) {
	var bbox = this.sourceObject.obj.getBBox(),
	currentX = this.obj.attr('x'),
	currentY = this.obj.attr('y');
	
	this.obj.translate(bbox.x + x - currentX, bbox.y + y - currentY);
	this.data.x = x;
	this.data.y = y;
	$(this.obj.node).trigger('changed');
}

//TODO: better inheritance
vonline.Annotation.prototype.setScale = function(x, y, origX, origY) {}
vonline.Annotation.prototype.setRotation = function(deg) {}
//vonline.Annotation.prototype.setClickEventMode = function() {}
vonline.Annotation.prototype.setRotationMode = function() {}
vonline.Annotation.prototype.setConnectionMode = function() {}
vonline.Annotation.prototype.setAnnotationMode = function() {}
vonline.Annotation.prototype.setTextMode = function() {}