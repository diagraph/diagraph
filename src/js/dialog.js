/**
 * @namespace
 */
vonline.Dialog = function(options) {
	this.options = this.getOptions(options);
	this.background = $('<div/>').addClass('dialog_background').appendTo('body');
	this.container = $('<div/>').addClass('dialog_container').appendTo('body');
	this.content = $('<div/>').html(this.options.text).appendTo(this.container);
	this.buttons = $('<div/>').addClass('dialog_buttons').appendTo(this.container);
	
	this.createButtons();
	
	this.options.init();
	
	var that = this;
	function onResize() {
		that.container.css({
			top: $(window).height() / 2 - that.container.outerHeight() + 'px',
			left: ($(window).width() - that.container.outerWidth()) / 2 + 'px'
		});
	}
	onResize();
}

vonline.Dialog.prototype.defaultOptions = {text: '', init: function() {}}

vonline.Dialog.prototype.getOptions = function(options) {
	return $.extend({}, this.defaultOptions, options);
}

vonline.Dialog.prototype.createButtons = function() {
	var that = this;
	$('<button/>').addClass('dialog_cancel cancel').text('close').appendTo(this.buttons).click(function() {
		that.close();
	});
}

vonline.Dialog.prototype.close = function() {
	this.background.detach();
	this.container.detach();
}

/**
 * @namespace
 */
vonline.ConfirmDialog = function(options) {
	vonline.Dialog.apply(this, [options]);
};
vonline.ConfirmDialog.prototype = new vonline.Dialog();

vonline.ConfirmDialog.prototype.defaultOptions = $.extend({}, vonline.Dialog.prototype.defaultOptions, {confirm: function() {}, cancel: function() {}});

vonline.ConfirmDialog.prototype.createButtons = function() {
	var that = this;
	this.cancel = $('<button/>').addClass('dialog_cancel cancel').text('cancel').appendTo(this.buttons).click(function() {
		that.close();
		that.options.cancel();
	})
	this.submit = $('<button/>').addClass('dialog_ok ok').text('ok').appendTo(this.buttons).click(function() {
		that.close();
		that.options.confirm();
	});

	function keyHandler (event) {
		if (event.keyCode == 13) {
			that.submit.triggerHandler('click');
			$(window).unbind('keydown', keyHandler);
			$(window).unbind('keypress', keyHandler);
		}
		else if (event.keyCode == 27) {
			that.cancel.triggerHandler('click');
			$(window).unbind('keydown', keyHandler);
			$(window).unbind('keypress', keyHandler);
		}
	}
	$(window).bind('keydown', keyHandler);
	$(window).bind('keypress', keyHandler);
}

/**
 * @namespace
 */
vonline.InputDialog = function(options) {
	var that = this;
	
	options = this.getOptions(options);
	var input = $('<input/>').attr({type: 'text', value: options.value});
	options.text = $('<div/>').append($('<div/>').text(options.text)).append($('<div/>').html(input));
	options.init = function() {
		input.focus();
		that.submit.unbind('click');
		that.submit.click(function() {
			that.close();
			that.options.confirm(input.val());
		});
	}
	vonline.ConfirmDialog.apply(this, [options]);
};

vonline.InputDialog.prototype = new vonline.ConfirmDialog();

vonline.InputDialog.prototype.defaultOptions = $.extend({}, vonline.ConfirmDialog.prototype.defaultOptions, {value: ''});