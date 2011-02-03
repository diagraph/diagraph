/**
 * @namespace
 */

vonline.DocumentItem = function(obj) {
	this.container = $('<tr/>');
	this.values = obj;
	
	
}

vonline.DocumentItem.prototype.getHTML = function() {
	var that = this;
	$.each(this.values, function(i, e) {
		if (vonline.DocumentList.header[i]) {
			var td = $('<td>').text(e);
			that.container.append(td);
			if (i == 'name') {
				td.click(function() {
					window.location.href = '?documentID='+that.values.id;
				}).css('cursor', 'pointer');
			}
		}
	});
	
	// create the edit-bar
	var menu = new vonline.Menu();
	menu.getHTML().appendTo($('<td/>').appendTo(that.container));
	
	menu.addItem(new vonline.MenuItem('open document', 'images/menu/document_open', function() {
		window.location.href = '?documentID='+that.values.id;
	}));
	
	menu.addItem(new vonline.MenuItem('delete document', 'images/menu/document_delete', function() {
		that.remove();
	}));
	
	
	return this.container;
}

vonline.DocumentItem.prototype.remove = function() {
	$.ajax({
		type: 'post',
		dataType: 'json',
		data: {task: 'deleteDocument', id: this.values.id},
		success: function(json) {
			vonline.events.trigger('document_deleted', [json]);
		}
	});
}