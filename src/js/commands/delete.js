/**
 * @namspace
 * @param {vonline.Canvas} canvas
 * @param {vonline.Base array} objects
 */
vonline.DeleteCommand = function(canvas, objects) {
	this.objects = objects;
	this.canvas = canvas;
	
	// get connected objects
	var canvas_objects = canvas.getObjects();
	for (var i = 0, len = this.objects.length; i < len; i++) {
		for (var j = 0, len2 = canvas_objects.length; j < len2; j++) {
			if (canvas_objects[j].isConnectedTo(this.objects[i])) {
				if ($.inArray(canvas_objects[j], this.objects) == -1) {
					this.objects.push(canvas_objects[j]);
				}
			}
		}
	}
}

vonline.DeleteCommand.prototype.execute = function() {
	for (var i = 0, len = this.objects.length; i < len; i++) {
		this.canvas.remove(this.objects[i]);
	}
}
vonline.DeleteCommand.prototype.undo = function() {
	for (var i = 0, len = this.objects.length; i < len; i++) {
		this.canvas.add(this.objects[i]);
	}
}