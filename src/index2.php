<?php

require_once 'php/config.inc.php';
require_once 'php/db.php';


if (!isset($_POST['task']) && ((config::debug_mode && !isset($_GET['task'])) || !config::debug_mode)) {
	// display the html page
	include_once 'html/template.phtml';
}
else {
	if(config::debug_mode && !isset($_POST['task']) && isset($_GET['task'])) {
		$_POST['task'] = $_GET['task'];
	}
	
	db::connect();
	
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
			break;
		case 'saveSnapshot':
			if(!isset($_POST['documentData'])) {
				echo "-1";
				break;
			}
			
			// TODO: escape and check
			$result = db::query('insert into snapshots values (default, 1, default, \''.$_POST['documentData'].'\')');
			echo $result[0];
			
			break;
		case 'loadSnapshot':
			if(!isset($_POST['snapshotID']) && ((config::debug_mode && !isset($_GET['snapshotID'])) || !config::debug_mode)) {
				break;
			}
			if(config::debug_mode && !isset($_POST['snapshotID']) && isset($_GET['snapshotID'])) {
				$_POST['snapshotID'] = $_GET['snapshotID'];
			}
			
			// TODO: escape and check
			$result = db::query('select data from snapshots where id = '.$_POST['snapshotID'].' limit 1');
			echo $result;
			break;
		default: break;
	}
	
	db::disconnect();
}