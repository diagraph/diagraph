<?php
	include("global.php");
	
	//
	class db {
		private static $db_connection = false;
		
		public static function connect() {
			self::$db_connection = mysql_connect(config::db_host.":".config::db_port, config::db_user, config::db_password)
			or die("Couldn't connect to DB: " . mysql_error());
			
			mysql_select_db(config::db_name)
			or die("Couldn't select DB: " . mysql_error());
		}
		public static function disconnect() {
			if(!self::$db_connection) return;
			mysql_close(self::$db_connection);
		}
		
		//public static function run() {}
		public static function get_categories() {
			$categories = array();
			
			$cat_res = mysql_query("select * from categories")
			or die("Couldn't execute get_categories query: " . mysql_error());
			
			while($row = mysql_fetch_row($cat_res)) {
				array_push($categories, array($row[0], $row[1]));
			}
			
			mysql_free_result($cat_res);
			
			return $categories;
		}
		public static function get_category_objects($category_id) {
		}
		
	}
	
	// TODO: move this somewhere else?
	//if(isset($_GET["type"])) $_POST["type"] = $_GET["type"]; // for debugging purposes
	if(isset($_POST["type"])) {
		$type = $_POST["type"];
		switch($type) {
			case "get_categories":
				db::connect();
				$categories = db::get_categories();
				db::disconnect();
				
				// output category info in json format
				$category_count = sizeof($categories);
				echo "{\n";
				echo "\"category_count\": " . $category_count . ",\n";
				echo "\"categories\":\n[\n";
				for($cat = 0; $cat < $category_count; $cat++) {
					echo "{\n";
					echo "\"id\": " . $categories[$cat][0] . ",\n";
					echo "\"name\": \"" . $categories[$cat][1] . "\"\n";
					echo "}" . ($cat+1 == $category_count ? "" : ",") . "\n";
				}
				echo "]\n";
				echo "}\n";
				
				break;
			case "get_category_objects":
				if(!isset($_POST["category_id"])) break;
				$category_id = $_POST["category_id"];
				echo "::objects";
				break;
			default:
				echo "Error: unknown type";
				break;
		}
	}

?>
