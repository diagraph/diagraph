/**
 * application class, cares on initialization and maintenance
 * @namespace
 * @param {number} id the document id
 */
vonline.Document = function(id) {
	this.id = id;
	// storage for undo-/redoable actions
	this.undoList = [];
	this.redoList = [];
	// observe if command was executed
	var that = this;
	vonline.events.bind('commandexec', function(event, command) {
		that.undoList.push(command);
		that.redoList = [];
		that.updateMenu();
		that.saveItem.enable();
	});
	
	this.transport = new vonline.Transport(this);
	
	// initialization of UI
	this.sidebar = new vonline.Sidebar('#sidebar');
	
	// init top menu
	this.sidebar.setTopMenu(this.initTopMenu());
	this.updateMenu();
	this.snapshotHistory = new vonline.SnapshotHistory(this, this.sidebar, this.transport);

	// init bottom menu
	this.sidebar.setBottomMenu(this.initBottomMenu());
	
	this.loadCategories();
	
	this.canvas = new vonline.Canvas();
	
	vonline.events.bind('drop', function(event, data) {
		var command = new vonline.CreateCommand(that.canvas, data);
		command.execute();
		vonline.events.trigger('commandexec', command);
	});
	
	// load latest snapshot
	this.loadSnapshot(-1);
}

/**
 * initializes the top-menu
 * @return {vonline.Menu}
 */
vonline.Document.prototype.initTopMenu = function() {
	var that = this,  // reference to current context (need to get the correct scope in click-hanlder functions)
		topmenu = new vonline.Menu();
	topmenu.addItem(new vonline.MenuItem('open an other document', 'images/menu/open_document_view', function() {
		that.openDocumentView();
	}));
	this.undoItem = new vonline.MenuItem('undo last action', 'images/menu/undo', function() {
		that.undoCommand();
	});
	topmenu.addItem(this.undoItem);
	this.redoItem = new vonline.MenuItem('redo previous action', 'images/menu/redo', function() {
		that.redoCommand();
	});
	topmenu.addItem(this.redoItem);
	this.saveItem = new vonline.MenuItem('save a snapshot of the current document', 'images/menu/save', function() {
		that.saveSnapshot();
	});
	topmenu.addItem(this.saveItem);
	topmenu.addItem(new vonline.MenuItem('view the history of the current document', 'images/menu/open_history', function() {
		that.snapshotHistory.toggle();
	}));
	return topmenu;
}

/**
 * initializes the bottom-menu
 * @return {vonline.Menu}
 */
vonline.Document.prototype.initBottomMenu = function() {
	var bottommenu = new vonline.Menu(),
	that = this;
	
	bottommenu.addItem(new vonline.MenuItem('edit categories', 'images/menu/open_category_edit_view', function() {
		if (that.categoryEditView.toggle()) {
			that.transport.saveCategories(that.categoryEditView.getCategories());
		}
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom in', 'images/menu/zoom_in', function() {
		var zoom = that.canvas.getZoom();
		if (zoom * 2 <= 16) {
			that.canvas.setZoom(zoom * 2);
		}
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom out', 'images/menu/zoom_out', function() {
		var zoom = that.canvas.getZoom();
		if (zoom / 2 >= 0.125) {
			that.canvas.setZoom(zoom / 2);
		}
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom to original', 'images/menu/zoom_original', function() {
		that.canvas.setZoom(1);
		that.canvas.setOffset(0, 0);
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom fit best', 'images/menu/zoom_fit_best', function() {
		that.canvas.setZoom('fit');
	}));
	return bottommenu;
}

/**
 * disable undo/redo-button if there is nothing to undo/redo
 */
vonline.Document.prototype.updateMenu = function() {
	if (this.undoList.length == 0) {
		this.undoItem.disable();
	}
	else {
		this.undoItem.enable();
	}
	if (this.redoList.length == 0) {
		this.redoItem.disable();
	}
	else {
		this.redoItem.enable();
	}
	vonline.events.trigger('canvaschanged');
}

/**
 * redirect browser to document list
 */
vonline.Document.prototype.openDocumentView = function() {
	window.location.href = 'demo.html';
}

/**
 * undo action (if possible)
 */
vonline.Document.prototype.undoCommand = function() {
	if (this.undoList.length > 0) {
		var command = this.undoList.pop();
		command.undo();
		this.redoList.push(command);
		this.updateMenu();
	}
}

/**
 * redo action (if possible)
 */
vonline.Document.prototype.redoCommand = function() {
	if (this.redoList.length > 0) {
		var command = this.redoList.pop();
		command.execute();
		this.undoList.push(command);
		this.updateMenu();
	}
}

/**
 * loads specific snapshot and display the corresponding document
 * @param {number} id the snapshot id (-1 for latest snapshot)
 */
vonline.Document.prototype.loadSnapshot = function(id) {
	var that = this;
	this.transport.loadSnapshot(id, function(json) {
		// load objects
		that.canvas.load(json.objects);
		that.undoList = [];
		that.redoList = [];
		that.updateMenu();
	});
}

/**
 * save a snapshot of the current document / send document data to server
 */
vonline.Document.prototype.saveSnapshot = function() {
	var that = this;
	
	documentData = JSON.stringify({objects: this.canvas.exportJSON()});
	// TODO: add other stuff that needs to be saved
	
	this.transport.saveSnapshot(documentData, function(data) {
		var status = 'Snapshot saved ' + format_time(new Date());
		vonline.notification.add(status);
		vonline.events.trigger('snapshotsaved');
	});
	
	this.saveItem.disable();
}

/**
 * load the categories for the document
 */
vonline.Document.prototype.loadCategories = function() {
	var that = this;
	this.transport.loadCategories(function(json) {
		var visible = [],
		notvisible = [];
		
		for (var name in json) {
			var category = new vonline.Category(name, json[name].id)
			for (var item in json[name].elements) {
				category.add(new vonline.CategoryItem(item, json[name].elements[item], that.canvas));
			}
			
			if (json[name].show) {
				visible.push(category);
				that.sidebar.addCategory(category);
			}
			else {
				notvisible.push(category);
			}
		}
		
		that.categoryEditView = new vonline.CategoryEditView(that.sidebar, visible, notvisible);
	});
}