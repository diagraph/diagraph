<?php

require_once 'config.inc.php';
require_once 'db.php';

db::connect();

if (!isset($_POST['task'])) {
	// display the html page
	include_once 'html/template.phtml';
}
else {
	switch ($_POST['task']) {
		case 'getCategories':
			// TODO: move in seperate class
			$json = array();
			$result = db::query('SELECT id, name FROM categories');
			foreach ($result as $row) {
				// category objects
				$json[$row['name']] = array();
			}
			echo json_encode($json);
	}
}