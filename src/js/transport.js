/**
 * @namspace
 * @param {vonline.Document} document
 */
vonline.Transport = function(document) {
	// initialize...
	var that = this;
	this.document = document;
	
	// use always POST-method on ajax calls
	$.ajaxSetup({type: 'post'});
	
	if (navigator.onLine) {
		that.sync();
	}
		 
	window.addEventListener("online", function() {
		that.sync();
	}, true);
		 
	window.addEventListener("offline", function() {
		vonline.notification.add("You're now offline. If you save the document, it will be sent when you go back online");
	}, true);
}

vonline.Transport.prototype.sync = function() {
	for (var i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i).substr(0, 17) == 'vonline_snapshot_') {
			var data = localStorage.getItem(localStorage.key(i));
			// TODO: add correct modification time
			this.saveSnapshot(data, function(){});
		}
	}
	// deletes local storage
	for (var i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i).substr(0, 17) == 'vonline_snapshot_') {
			localStorage.removeItem(localStorage.key(i));
		}
	}
	
	if (localStorage.getItem('vonline_visible_categories')) {
		this.saveCategories(JSON.parse(localStorage.getItem('vonline_visible_categories')))
		localStorage.removeItem('vonline_visible_categories')
	}
}

vonline.Transport.prototype.loadCategories = function(callback) {
	if (navigator.onLine) {
		$.ajax({
			data: {task: 'loadCategories', documentID: this.document.id},
			dataType: 'json',
			success: function(json) {
				localStorage.setItem('vonline_categories', JSON.stringify(json));
				callback(json);
			}
		});
	}
	else {
		var result = window.localStorage.getItem('vonline_categories');
		if (result) {
			callback(JSON.parse(result));
		}
	}
}

vonline.Transport.prototype.saveCategories = function(categories) {
	if (navigator.onLine) {
		$.ajax({
			data: {task: 'saveCategories', documentID: this.document.id, categories: JSON.stringify(categories)},
			dataType: 'json'
		});
	}
	else {
		window.localStorage.setItem('vonline_visible_categories', JSON.stringify(categories));
	}
	var offlinedata = JSON.parse(window.localStorage.getItem('vonline_categories'));
	for (var name in offlinedata) {
		if ($.inArray(offlinedata[name].id, categories) != -1) {
			offlinedata[name].show = true;
		}
		else {
			offlinedata[name].show = false;
		}
	}
	localStorage.setItem('vonline_categories', JSON.stringify(offlinedata));
}

/**
 * @param {JSON string} documentData
 * @param {function} callback;
 */
vonline.Transport.prototype.saveSnapshot = function(documentData, callback) {
	if (navigator.onLine) {
		$.ajax({
			data: {task: 'saveSnapshot', documentID: this.document.id, documentData: documentData},
			dataType: 'json',
			success: function(json) {
				callback(json);
			}
		});	
	}
	else {
		var unixtime = (new Date()).getTime();
		window.localStorage.setItem("vonline_snapshot_"+unixtime, documentData);
	}
	localStorage.setItem('vonline_last_snapshot', documentData);
}

vonline.Transport.prototype.loadSnapshot = function(id, callback) {
	if (navigator.onLine) {
		$.ajax({
			data: {task: 'loadSnapshot', snapshotID: id, documentID: this.document.id},
			dataType: 'json',
			success: function(json) {
				localStorage.setItem('vonline_last_snapshot', JSON.stringify(json));
				callback(json);
			}
		});
	}
	else if (id == -1) {
		var result = window.localStorage.getItem('vonline_last_snapshot');
		if (result) {
			callback(JSON.parse(result));
		}
	}
}

vonline.Transport.prototype.getSnapshots = function(callback) {
	if (navigator.onLine) {
		$.ajax({
			data: {task: 'getSnapshots', documentID: this.document.id},
			dataType: 'json',
			success: function(json) {
				localStorage.setItem('vonline_snapshots', JSON.stringify(json));
				callback(json);
			}
		});
	}
	else {
		var result = window.localStorage.getItem('vonline_snapshots');
		if (result) {
			callback(JSON.parse(result));
		}
	}
}
