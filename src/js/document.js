/**
 * application class, cares on initialization and maintenance
 * @namespace
 */
vonline.Document = function() {
	// storage for undo-/redoable actions
	this.undoList = [];
	this.redoList = [];
	// observe if command was executed
	var that = this;
	vonline.events.bind('commandexec', function(event, command) {
		that.undoList.push(command);
		that.redoList = [];
		that.updateMenu();
	});
	
	// initialization of UI
	this.sidebar = new vonline.Sidebar('#sidebar');
	
	// init top menu
	this.sidebar.setTopMenu(this.initTopMenu());
	this.updateMenu();

	// init bottom menu
	this.sidebar.setBottomMenu(this.initBottomMenu());
	
	this.loadCategories();
	
	this.canvas = new vonline.Canvas();
	
	// example
	this.canvas.load([
	                  {path:'rectangle', id:1, scaleX:1, scaleY:1, x: 100, y:50},
	                  {path:'rectangle', id:2, scaleX:1, scaleY:1, x: 200, y:100},
	                  ])
}

/**
 * initializes the top-menu
 * @return vonline.Menu
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
	topmenu.addItem(new vonline.MenuItem('save a snapshot of the current document', 'images/menu/save', function() {
		that.saveSnapshot();
	}));
	topmenu.addItem(new vonline.MenuItem('view the history of the current document', 'images/menu/open_history', function() {
		// TODO: init history view
	}));
	return topmenu;
}

/**
 * initializes the bottom-menu
 * @return vonline.Menu
 */
vonline.Document.prototype.initBottomMenu = function() {
	var bottommenu = new vonline.Menu();
	bottommenu.addItem(new vonline.MenuItem('edit categories', 'images/menu/open_category_edit_view', function() {
		// TODO: init category edit view
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom in', 'images/menu/zoom_in', function() {
		// TODO: canvas viewport manipulation
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom out', 'images/menu/zoom_out', function() {
		// TODO: canvas viewport manipulation
	}));
	bottommenu.addItem(new vonline.MenuItem('zoom fit best', 'images/menu/zoom_fit_best', function() {
		// TODO: canvas viewport manipulation
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
	// TODO
	console.log(this);
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
 */
vonline.Document.prototype.loadSnapshot = function(id) {
	// TODO
}

/**
 * save a snapshot of the current document / send document data to server
 */
vonline.Document.prototype.saveSnapshot = function() {
	// TODO
}

/**
 * load the categories for the document
 * @deprecated should be placed in another class
 */
vonline.Document.prototype.loadCategories = function() {
	var that = this;
	$.ajax({
		data: {task: 'getCategories'},
		dataType: 'json',
		success: function(json) {
			for (var category in json) {
				that.sidebar.addCategory(new vonline.Category(category));
				// TODO: add components
			}
		}
	});
}