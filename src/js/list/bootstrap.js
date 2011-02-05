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
	
	$('#about').click(function() {
		new vonline.Dialog({text: '<div style="text-align:center"><p><b>Visio-Online prototype</b></p><p>2011 Leander Tentrup, Forian Ziesche</p></div><p>credits:<ul><li><a href="http://jquery.com/">jQuery</a></li><li><a href="http://raphaeljs.com/">RaphaelJS</a></li><li><a href="http://www.oxygen-icons.org/">Oxygen Icon Set</a></li></ul></p>'});
	});
});
