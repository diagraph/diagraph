/**
 * @namspace
 * @param {vonline.Document} document
 */
vonline.Transport = function(document) {
	// initialize...
	var that = this;
	this.document = document;
	this.prefix = 'vonline_'+document.id+'_';
	
	// use always POST-method on ajax calls
	$.ajaxSetup({type: 'post'});
	
	if (navigator.onLine) {
		that.sync();
	}
	
	// if IE 8< is used, return here
	if($.browser.msie && parseInt(jQuery.browser.version) <= 8) {
		return;
	}
	
	window.addEventListener("online", function() {
		that.sync();
	}, true);
		 
	window.addEventListener("offline", function() {
		vonline.notification.add("You're now offline. If you save the document, it will be sent when you go back online");
	}, true);
}

vonline.Transport.prototype.sync = function() {
	var prefix = this.prefix + 'snapshot_';
	
	for (var i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i).substr(0, prefix.length) == prefix) {
			var data = localStorage.getItem(localStorage.key(i));
			$.ajax({
				data: {task: 'saveSnapshot', documentID: this.document.id, documentData: documentData, timestamp: parseInt(localStorage.key(i).slice(prefix.length) / 1000, 10)},
				dataType: 'json',
				success: function(json) {
					//callback(json);
				}
			});	
		}
	}
	
	// deletes local storage
	for (var i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i).substr(0, prefix.length) == prefix) {
			localStorage.removeItem(localStorage.key(i));
		}
	}
	
	if (localStorage.getItem(this.prefix+'visible_categories')) {
		this.saveCategories(JSON.parse(localStorage.getItem(this.prefix+'visible_categories')));
		localStorage.removeItem(this.prefix+'visible_categories');
	}
}

vonline.Transport.prototype.loadCategories = function(callback) {
	if (navigator.onLine) {
		var that = this;
		$.ajax({
			data: {task: 'loadCategories', documentID: this.document.id},
			dataType: 'json',
			success: function(json) {
				localStorage.setItem(that.prefix+'categories', JSON.stringify(json));
				callback(json);
			}
		});
	}
	else {
		var result = window.localStorage.getItem(this.prefix+'categories');
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
		window.localStorage.setItem(this.prefix+'visible_categories', JSON.stringify(categories));
	}
	var offlinedata = JSON.parse(window.localStorage.getItem(this.prefix+'categories'));
	for (var name in offlinedata) {
		if ($.inArray(offlinedata[name].id, categories) != -1) {
			offlinedata[name].show = true;
		}
		else {
			offlinedata[name].show = false;
		}
	}
	localStorage.setItem(this.prefix+'categories', JSON.stringify(offlinedata));
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
		window.localStorage.setItem(this.prefix+'snapshot_'+unixtime, documentData);
	}
	localStorage.setItem(this.prefix+'last_snapshot', documentData);
}

vonline.Transport.prototype.loadSnapshot = function(id, callback) {
	if (navigator.onLine) {
		var that = this;
		$.ajax({
			data: {task: 'loadSnapshot', snapshotID: id, documentID: this.document.id},
			dataType: 'json',
			success: function(json) {
				localStorage.setItem(that.prefix+'last_snapshot', JSON.stringify(json));
				callback(json);
			}
		});
	}
	else if (id == -1) {
		var result = window.localStorage.getItem(this.prefix+'last_snapshot');
		if (result) {
			callback(JSON.parse(result));
		}
	}
}

vonline.Transport.prototype.getSnapshots = function(callback) {
	if (navigator.onLine) {
		var that = this;
		$.ajax({
			data: {task: 'getSnapshots', documentID: this.document.id},
			dataType: 'json',
			success: function(json) {
				localStorage.setItem(that.prefix+'snapshots', JSON.stringify(json));
				callback(json);
			}
		});
	}
	else {
		var result = window.localStorage.getItem(this.prefix+'snapshots');
		if (result) {
			callback(JSON.parse(result));
		}
	}
}
