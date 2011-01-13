/**
 * Class for managing the svg elements
 * @namespace
 */
vonline.Canvas = function() {
	this.container = $('#canvas');
	this.paper = Raphael('canvas', this.container.width(), this.container.height());
	this.objects = [];
	var that = this;
	
	function onResize() {
		var sidebarwidth = $('#sidebar').width(),
			documentwidth = $(window).width();
		that.container.css({width: (documentwidth-sidebarwidth)+'px', marginLeft: sidebarwidth+'px'});
		that.paper.setSize(that.container.width(), that.container.height());
	}
	$(window).bind('resize', onResize);
}

/**
 * loads a document from its json representation
 * @param {array} json array containing the components
 * @exmaple
 * vonline.document.canvas.load([{path:'rectangle', id:1, scaleX:1, scaleY:1, x: 100, y:50}]);
 */
vonline.Canvas.prototype.load = function(json) {
	for (var i = 0, count = json.length; i < count; i++) {
		switch (json[i].path) {
			case 'rectangle':
				var obj = new vonline.Rectangle(json[i]);
				this.add(obj);
			break;
		}
	}
}

/**
 * @param {vonline.Base} obj
 */
vonline.Canvas.prototype.add = function(obj) {
	obj.setCanvas(this);
	this.objects.push(obj);
}

vonline.Canvas.prototype.getPaper = function() {
	return this.paper;
}

vonline.Canvas.prototype.exportJSON = function() {
	var json = [];
	for (var i = 0, count = objects.length; i < count; i++) {
		json.push(objects[i].toJSON());
	}
	return json;
}