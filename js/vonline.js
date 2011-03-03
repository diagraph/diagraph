/**
 * global application scope
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