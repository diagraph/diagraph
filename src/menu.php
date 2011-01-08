<?php
	include("global.php");
	
	function display_menu() {
		//
		$menu_html = file_get_contents("html/menu.html");
		$menu_category_html = file_get_contents("html/menu_category.html");
		$menu_category_item_html = file_get_contents("html/menu_category_item.html");
		
		// TODO: get categories and category items from db (or cache)
		// for now: add dummy categories and items
		$categories = array(
							"Basics", array(
											"Rectangle", "basics_rectangle.svg",
											"Circle", "basics_circle.svg",
											"Rectangle", "basics_rectangle.svg",
											"Circle", "basics_circle.svg",
											"Rectangle", "basics_rectangle.svg",
											"Circle", "basics_circle.svg",
											),
							
							"UML", array(
										 "Rectangle", "basics_rectangle.svg",
										 "Circle", "basics_circle.svg",
										 "Rectangle", "basics_rectangle.svg",
										 "Circle", "basics_circle.svg",
										 "Rectangle", "basics_rectangle.svg",
										 "Circle", "basics_circle.svg",
										 ),
							
							"Simulink", array(
											  "Rectangle", "basics_rectangle.svg",
											  "Circle", "basics_circle.svg",
											  "Rectangle", "basics_rectangle.svg",
											  "Circle", "basics_circle.svg",
											  "Rectangle", "basics_rectangle.svg",
											  "Circle", "basics_circle.svg",
											  ),
		);
		
		$category_data = "";
		for($cat = 0; $cat < sizeof($categories)/2; $cat++) {
			$cat_name = $categories[$cat*2];
			$cat_items = $categories[$cat*2 + 1];
			
			$cat_item_data = "";
			for($item = 0; $item < sizeof($cat_items)/2; $item++) {
				$item_name = $cat_items[$item*2];
				$item_image = $cat_items[$item*2 + 1];
				$item_data = str_replace("{VO_MENU_CATEGORY_ITEM_IMAGE}", "images/".$item_image, $menu_category_item_html);
				$cat_item_data .= $item_data;
			}
			
			$cat_data = str_replace("{VO_MENU_CATEGORY_CONTENT}", $cat_item_data, $menu_category_html);
			$cat_data = str_replace("{VO_MENU_CATEGORY_NAME}", $cat_name, $cat_data);
			$cat_data = str_replace("{VO_MENU_CATEGORY_NAME_LC}", strtolower($cat_name), $cat_data);
			$category_data .= $cat_data;
		}
		
		$menu_data = str_replace("{VO_MENU_CONTENT}", $category_data, $menu_html);
		
		echo $menu_data;
	}
	
?>
