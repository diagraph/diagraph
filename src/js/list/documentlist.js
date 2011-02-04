/**
 * @namespace
 */

vonline.DocumentList = function() {
	this.container = $('<table/>').appendTo('#documentlist');
	this.header = $('<thead/>').appendTo(this.container);
	this.body = $('<tbody/>').appendTo(this.container);
	this.documents = [];
	
	// initialize
	this.createHeader();
	this.loadDocuments();
	
	var that = this;
	vonline.events.bind('documentlist_changed', function() {
		that.clear();
		that.loadDocuments();
	});
}

vonline.DocumentList.header = {
	name: 'Name',
	creation_date: 'Created on',
	modification_date: 'Last modification',
	edit: 'Edit'
}

vonline.DocumentList.prototype.createHeader = function() {
	this.header.html();
	var container = $('<tr/>').appendTo(this.header);
	$.each(vonline.DocumentList.header, function(i, e) {
		container.append($('<th/>').text(e));
	});
}

/**
 * @param {vonline.DaocumentItem}
 */
vonline.DocumentList.prototype.addDocument = function(document) {
	this.documents.push(document);
	this.refreshView();
}

/**
 * @param {vonline.DaocumentItem array}
 */
vonline.DocumentList.prototype.addDocuments = function(documents) {
	var that = this;
	$.each(documents, function(i, e) {
		that.documents.push(e);
	});
	this.refreshView();
}

vonline.DocumentList.prototype.clear = function() {
	this.documents = [];
	this.refreshView();
}

vonline.DocumentList.prototype.loadDocuments = function() {
	var that = this;
	var documents = [];
	$.ajax({
		type: 'post',
		dataType: 'json',
		data: {task: 'loadDocuments'},
		success: function(json) {
			$.each(json, function(i, e) {
				documents.push(new vonline.DocumentItem(e));
			});
			that.addDocuments(documents);
		}
	});
}

vonline.DocumentList.prototype.refreshView = function() {
	var that = this;
	
	this.body.html('');
	$.each(this.documents, function(i, e) {
		that.body.append(e.getHTML());
	});
}

vonline.DocumentList.prototype.createDocument = function() {
	var name = window.prompt('enter a name for the document');
	if (name && name != '') {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {task: 'createDocument', name: name},
			success: function(json) {
				window.location.href = '?documentID='+json;
			}
		});
	}
}