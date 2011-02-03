/**
 * 
 */

// calls when dom is ready
$(function() {
	var documentlist = new vonline.DocumentList();
	var topmenu = new vonline.Menu();
	topmenu.getHTML().appendTo('#topmenu');
	
	topmenu.addItem(new vonline.MenuItem('create new document', 'images/menu/document_new', function() {
		documentlist.createDocument();
	}));
});
