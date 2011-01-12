<?php
	include("global.php");
	
	function display_canvas() {
		//
		$canvas_html = file_get_contents("html/canvas.html");
		
		echo $canvas_html;
	}
	
?>
