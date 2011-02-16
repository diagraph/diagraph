/**
 * @param {vonline.Document} document
 * @param {vonline.Sidebar} sidebar
 * @param {vonline.Transport} transport
 */
vonline.SnapshotHistory = function(document, sidebar, transport) {
	this.document = document;
	this.sidebar = sidebar;
	this.transport = transport;
	this.container = null;
	this.snapshotList = null;
	this.snapshotListItems = null;
	this.selectedSnapshot = -1;
	
	//
	var that = this;
	this.loadButton = $('<button/>').attr('title', 'load snapshot').addClass('loadButton')
	.bind('load', function() {
		$(window).trigger('resize');
	})
	.bind('click', function() {
		that.loadSnapshot();
	})
	.append('load').hide();
	this.sidebar.getTopMenu().children().append(this.loadButton);
	
	//
	this.history = $('<div/>').addClass('history');
	
	//
	vonline.events.bind('snapshotsaved', function() {
		that.update();
	});
}

vonline.SnapshotHistory.prototype.open = function() {
	if(this.sidebar.isExtraViewVisible()) return;
	
	// init menu, enable everything
	this.container = this.sidebar.setExtraView(true);
	this.container.append(this.history);
	this.loadButton.show().css('display', 'inline-block');
	this.history.show();
	this.update();
}

vonline.SnapshotHistory.prototype.update = function() {
	if(this.container == null) return;

	// clear history and get/add new snapshots
	var that = this;
	this.history.empty();
	this.transport.getSnapshots(function(json) {
		var num = 1;
		that.snapshotList = $('<ul/>').addClass('snapshotList');
		that.snapshotListItems = [];
		$.each(json, function(i, e) {
			that.snapshotListItems.push(
					$('<li/>')
					.addClass('snapshotListItem')
					.attr('id', 'snapshot'+e.id)
					.attr('title', e.id)
					.append('#'+num+' '+e.creation_date)
					.bind('click', function(event) {
						that.selectSnapshot(event.currentTarget.id);
					})
					.append($('<img/>').attr('src', 'images/canvas/edit_delete.png')
							.click(function() {that.deleteSnapshot(e.id);}))
				);
				
				that.snapshotList.prepend(that.snapshotListItems[that.snapshotListItems.length-1]);
				num++;
		});
		that.history.append(that.snapshotList);
	});
}

vonline.SnapshotHistory.prototype.close = function() {
	this.sidebar.setExtraView(false);
	this.container = null;
	this.loadButton.hide();
	this.history.hide();
	this.history.detach();
	this.snapshotList = null;
	this.snapshotListItems = null;
	this.selectedSnapshot = -1;
}

/**
 * @return {boolean} if view was closed
 */
vonline.SnapshotHistory.prototype.toggle = function() {
	var ret = false;
	if (this.container) {
		this.close();
		ret = true;
	}
	else if(!this.sidebar.isExtraViewVisible()) {
		this.open();
		ret = false;
	}
	$(window).trigger('resize');
	return ret;
}

vonline.SnapshotHistory.prototype.loadSnapshot = function() {
	if (this.selectedSnapshot != -1) {
		this.document.loadSnapshot(this.selectedSnapshot);
	}
	this.toggle();
}

vonline.SnapshotHistory.prototype.selectSnapshot = function(id) {
	if (!this.snapshotListItems) return;
	
	for (var i = 0; i < this.snapshotListItems.length; i++) {
		this.snapshotListItems[i].removeClass('selected');
		if(this.snapshotListItems[i].attr('id') == id) {
			this.snapshotListItems[i].addClass('selected');
			this.selectedSnapshot = parseInt(this.snapshotListItems[i].attr('title'));
		}
	}
}

vonline.SnapshotHistory.prototype.deleteSnapshot = function(id) {
	this.transport.deleteSnapshot(id);
}