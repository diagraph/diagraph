/**
 * 
 */
vonline.Canvas = function() {
	var container = $('#canvas'),
	r = Raphael('canvas', container.width(), container.height()),
	objects = [];
	
	function onResize() {
		var sidebarwidth = $('#sidebar').width(),
			documentwidth = $(window).width();
		container.css({width: (documentwidth-sidebarwidth)+'px', marginLeft: sidebarwidth+'px'});
		r.setSize(container.width(), container.height());
	}
	$(window).bind('resize', onResize);
	
	/**
	 * loads a document from its json representation
	 * @param {array} json array containing the components
	 */
	this.load = function(json) {
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
	this.add = function(obj) {
		obj.setCanvas(this);
		objects.push(obj);
	}
	
	this.getPaper = function() {
		return r;
	}
	
	this.exportJSON = function() {
		var json = [];
		for (var i = 0, count = objects.length; i < count; i++) {
			json.push(objects[i].toJSON());
		}
		return json;
	}
}