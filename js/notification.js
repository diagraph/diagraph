/**
 * @namepsace 
 */
vonline.Notification = function() {
	this.container = $('<div/>').addClass('notification').appendTo('#canvas');
}

/**
 * @param {string} message
 * @param {object} options
 */
vonline.Notification.prototype.add = function(message, options) {
	options = $.extend({
		timeout: 5,
		callback: null,
		init: null
	}, options);
	var e = $('<div/>').text(message).appendTo(this.container),
	that = this;
	
	if (options.init) {
		options.init(e);
	}
	if (options.timeout > 0) {
		var timeouthandler = this.setTimeout(e, options.timeout);
		e.mouseover(function() {
			window.clearTimeout(timeouthandler);
		});
		e.mouseout(function() {
			timeouthandler = that.setTimeout(e, 2);
		});
	}
	if (options.callback) {
		e.click(function() {
			options.callback();
			e.fadeOut(function(){$(this).detach();});
		});
	}
	else if (options.timeout > 0) {
		e.click(function() {
			e.fadeOut(function(){$(this).detach();});
		});
	}
}

vonline.Notification.prototype.setTimeout = function(e, timeout) {
	return window.setTimeout(function() {
		e.fadeOut(function(){$(this).detach();});
	}, timeout*1000);
}