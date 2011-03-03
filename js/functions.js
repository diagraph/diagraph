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

/**
 * formats Date to SQL time, e.g. 2011-02-04 10:52:47
 * @param {Date} date
 * @returns {String}
 */
function format_time(date) {
	return date.getFullYear() + '-'
	 + format_decimal(date.getMonth()+1, 2) + '-'
	 + format_decimal(date.getDate(), 2) + ' ' 
	 + format_decimal(date.getHours(), 2) + ':' 
	 + format_decimal(date.getMinutes(), 2) + ':'
	 + format_decimal(date.getSeconds(), 2);
}

/**
 * adds leading zeros to a number
 * @param number
 * @param decimals
 * @returns
 */
function format_decimal(number, decimals) {
	var str = String(number);
	if (str.length < decimals) {
		return format_decimal('0'+str, decimals);
	}
	return str;
}