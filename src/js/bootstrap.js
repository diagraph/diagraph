/**
 * initializing document: create UI, loading document data
 */

if (!window.vonline) {
	window.vonline = {};
}

// calls when dom is ready
$(function() {
	vonline.document = new vonline.Document();
});