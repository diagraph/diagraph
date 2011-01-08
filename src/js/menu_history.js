
var b_menu_history = false;
function menu_toggle_history() {
	b_menu_history ^= true;
	
	var history_div = document.getElementById("history");
	var canvas_div = document.getElementById("canvas");
	
	// enable/view snapshot history
	if(b_menu_history) {
		history_div.style.display = "inline-block";
		canvas_div.style.left = "456px";
	}
	// disable snapshot history
	else {
		history_div.style.display = "none";
		canvas_div.style.left = "205px";
	}
	
	// TODO: update snapshot history content
}
