/**
 * initializing document: create UI, loading document data
 */


// calls when dom is ready
$(function() {
	vonline.notification = new vonline.Notification();
	
	var query = $.parseQueryString();
	vonline.document = new vonline.Document(query.documentID);
});