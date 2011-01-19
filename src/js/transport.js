/**
 * @namspace
 */
vonline.Transport = function() {
	// initialize...
	var that = this;
	
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

/**
 * @param {object} data
 */
vonline.Transport.prototype.ajax = function(ajax) {
	ajax.dataType = 'json';
	
	if (navigator.onLine) {
		if (ajax.cacheOffline == true) {
			var success = ajax.success;
			ajax.success = function(json) {
				window.localStorage.setItem('ajax_'+ajax.data.task, JSON.stringify(json));
				success(json);
			}
		}
		
		$.ajax(ajax);
	}
	else {
		// try to lookup offline cached results
		if (ajax.cacheOffline == true) {
			var result = window.localStorage.getItem('ajax_'+ajax.data.task);
			if (result) {
				ajax.success(JSON.parse(result));
			}
		}
		else {
			var unixtime = parseInt((new Date()).getTime()/1000, 10);
			window.localStorage.setItem("ajax_"+ajax.data.task+"_"+unixtime, JSON.stringify(ajax.data));
		}
	}
}

vonline.Transport.prototype.sync = function() {
	for (var i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i).substr(0, 5) == 'ajax_') {
			var data = JSON.parse(localStorage.getItem(localStorage.key(i)));
			$.ajax({data: data});
		}
	}
	// deletes local storage
	for (var i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i).substr(0, 5) == 'ajax_') {
			localStorage.removeItem(localStorage.key(i));
		}
	}
}