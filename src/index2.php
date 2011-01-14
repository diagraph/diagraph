<?php

require_once 'php/config.inc.php';
require_once 'php/db.php';

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
				$result2 = db::query('SELECT name, data FROM objects WHERE category = '.$row['id']);
				$elements = array();
				foreach ($result2 as $row2) {
					$elements[$row2['name']] = $row2['data'];
				}
				$json[$row['name']] = array('id'=>$row['id'], 'elements'=>$elements);
			}
			echo json_encode($json);
	}
}