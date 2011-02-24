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
	
	// create hidden file input
	var fileinput = $('<input/>').attr('type', 'file').css('display', 'none').appendTo('body')
	.change(function(event) {
		if (fileinput[0].files.length) {
			var file = fileinput[0].files[0];
			var reader = new FileReader();
			  
			// Read file into memory as UTF-16      
			reader.readAsText(file, "UTF-8");
			
			reader.onload = function(event) {
				documentlist.importDocument(event.target.result);
			};
		}
	});
	topmenu.addItem(new vonline.MenuItem('import document', 'images/menu/document_import', function() {
		fileinput.click();
	}));
	
	$('#about').click(function() {
		new vonline.Dialog({text: '<div style="text-align:center"><p><b>Visio-Online prototype</b></p><p>2011 Leander Tentrup, Forian Ziesche<br/>Open Source under <a href="http://creativecommons.org/licenses/BSD/">BSD License</a></p></div><p>credits:<ul><li><a href="http://jquery.com/">jQuery</a></li><li><a href="http://raphaeljs.com/">RaphaelJS</a></li><li><a href="https://github.com/wout/raphael-zoom">Raphael Zoom Plugin</a></li><li><a href="http://www.oxygen-icons.org/">Oxygen Icon Set</a></li></ul></p>'});
	});
});
