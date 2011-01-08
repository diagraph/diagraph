<?php
	include("global.php");
	include("menu.php");
	include("canvas.php");
	include("history.php");
	
	// display
	include("html/header.html");
	display_menu();
	display_history();
	display_canvas();
	include("html/footer.html");
	
?>
