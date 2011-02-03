/**
 * misc functions
 */

/**
 * parses url query string to javascript array
 */
jQuery.parseQueryString = function() {
	var query = window.location.search.substring(1),
	vars = query.split("&"),
	query = {};
	for (var i = 0, len = vars.length; i < len; i++) {
		vars[i] = vars[i].split('=');
		query[vars[i][0]] = vars[i][1];
	}
	return query;
}

/**
 * returns an array without the value elements
 * @param {array} array
 * @param {mixed} value
 */
jQuery.without = function(array, value) {
	return jQuery.grep(array, function(val) {
		return val != value;
	});
}