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
		return array();
	}
	
	/**
	 * modified version of mysql_query:
	 * - returns result of query as an (associative) array
	 * - if query ends with 'LIMIT 1', the value is returned
	 * - instead of an error message, an exception is thrown
	 * - if query isn't from type 'SELECT', the number of changed rows is returned
	 * @param string $query
	 * @param boolean $assoc
	 */
	public static function query($query, $assoc = true) {
		$r = @mysql_query($query);
		if (mysql_errno()) {
			throw new Exception(mysql_error().", Query: ".$query);
		}
		if (strtolower(substr($query, 0, 6)) != 'select') {
			return array(mysql_affected_rows(), mysql_insert_id(), 'affected'=>mysql_affected_rows(), 'insertid'=>mysql_insert_id());
		}
		$count = @mysql_num_rows($r);
		if (!$count) {
			return false;
		}
		else if ($count == 1) {
			if ($assoc) {
				$f = mysql_fetch_assoc($r);
			}
			else {
				$f = mysql_fetch_row($r);
			}
			mysql_free_result($r);
			if (count($f) == 1 && strtolower(substr($query, -7)) == 'limit 1') {
				list($key) = array_keys($f);
				return $f[$key];
			}
			else if (strtolower(substr($query, -7)) == 'limit 1') {
				return $f;
			}
			else {
				$all = array();
				$all[] = $f;
				return $all;
			}
		}
		else {
			$all = array();
			for ($i = 0; $i < $count; $i++) {
				if ($assoc) {
					$f = mysql_fetch_assoc($r);
				}
				else {
					$f = mysql_fetch_row($r);
				}
				$all[] = $f;
			}
			mysql_free_result($r);
			return $all;
		}
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
