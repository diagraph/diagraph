/**
 * initializing document: create UI, loading document data
 */

if (!window.vonline) {
	/**
	 * global application scope
	 * @name vonline
	 */
	window.vonline = {
		/** used for custom events */
		events: $({}),
		GRIDSIZE: 8
	};
}

// use always POST-method on ajax calls
$.ajaxSetup({type: 'post'});

// calls when dom is ready
$(function() {
	var query = vonline.parseQueryString();
	vonline.document = new vonline.Document(query.documentID);
});

/**
 * parses url query string to javascript array
 */
vonline.parseQueryString = function() {
	var query = window.location.search.substring(1),
	vars = query.split("&"),
	query = {};
	for (var i = 0, len = vars.length; i < len; i++) {
		vars[i] = vars[i].split('=');
		query[vars[i][0]] = vars[i][1];
	}
	return query;
}