<?php
	include("php/global.php");
	include("php/menu.php");
	include("php/canvas.php");
	include("php/history.php");
	
	// display
	include("html/header.html");
	display_menu();
	display_history();
	display_canvas();
	include("html/footer.html");
	
?>
