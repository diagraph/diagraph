/**
 * @namespace
 */
vonline.vector = {}

vonline.vector.normalize = function(vec) {
	var len = Math.sqrt(vec.x*vec.x + vec.y*vec.y);
	return {x: vec.x / len, y: vec.y / len};
}