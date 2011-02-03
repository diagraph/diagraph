/**
 * @namespace
 */

vonline.DocumentItem = function(obj) {
	this.container = $('<tr/>');
	this.values = obj;
	this.valcontainer = {};
	
}

vonline.DocumentItem.prototype.getHTML = function() {
	var that = this;
	$.each(this.values, function(i, e) {
		if (vonline.DocumentList.header[i]) {
			that.valcontainer[i] = $('<td>').text(e);
			that.container.append(that.valcontainer[i]);
			if (i == 'name') {
				that.valcontainer[i].click(function() {
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
	
	menu.addItem(new vonline.MenuItem('rename document', 'images/menu/document_rename', function() {
		that.rename();
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

vonline.DocumentItem.prototype.rename = function() {
	var that = this;
	var newname = window.prompt('Enter a new name for the document');
	if (newname && newname != '') {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {task: 'renameDocument', id: this.values.id, newname: newname},
			success: function(json) {
				that.valcontainer.name.text(newname);
			}
		});
	}
}