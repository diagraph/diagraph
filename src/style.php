<?php
	// generate css
	header("Content-type: text/css");
	
	// select color scheme
	// TODO: let the user select a color scheme (+ save and load in/from cookie)
	//$color_scheme = "dark";
	$color_scheme = "light";
	if($color_scheme == "dark") {
		$color["bg_1"] = "#5f5f5f"; // darkest
		$color["bg_2"] = "#888888"; //    -
		$color["bg_3"] = "#aaaaaa"; // lightest
		$color["bg_select_1"] = $color["bg_2"];
		$color["bg_select_2"] = $color["bg_3"];
		$color["font"] = "#ffffff";
		$color["menu_border"] = "#444444";
	}
	else if($color_scheme == "light") {
		$color["bg_1"] = "#cccccc";
		$color["bg_2"] = "#f7f7f7";
		$color["bg_3"] = "#ffffff";
		$color["bg_select_1"] = "#aaaaaa";
		$color["bg_select_2"] = "#cccccc";
		$color["font"] = "#000000";
		$color["menu_border"] = "#444444";
	}
	else error("unknown color scheme");
	
	// get style content and replace all color variables
	$style_data = file_get_contents("css/style.css");
	reset($color);
	while(list($color_name, $color_val) = each($color)) {
		$style_data = str_replace("\$color_".$color_name, $color_val, $style_data);
	}
	
	// and finally: output css
	echo <<<CSS
	$style_data
CSS;
?>
