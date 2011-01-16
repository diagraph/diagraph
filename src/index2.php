<?php

require_once 'php/config.inc.php';
require_once 'php/db.php';

function post_isset($name) {
	if(!isset($_POST[$name]) && ((config::debug_mode && !isset($_GET[$name])) || !config::debug_mode)) {
		return false;
	}
	return true;
}
function dbg_set($name) {
	if(config::debug_mode && !isset($_POST[$name]) && isset($_GET[$name])) {
		$_POST[$name] = $_GET[$name];
	}
}


if (!post_isset('task')) {
	// display the html page
	include_once 'html/template.phtml';
}
else {
	dbg_set('task');
	
	db::connect();
	
	switch ($_POST['task']) {
		case 'getCategories':
			// TODO: move in seperate class
			
			// check if the document restricts the visible categories
			$restrict_categories = false;
			if(post_isset('documentID')) {
				dbg_set('documentID');
				$restrict_categories = true;
				// TODO: escape and check
				$categories_result = db::query('select categories from documents where id = '.$_POST['documentID'].' limit 1');
			}
			
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
			$json_data = json_encode($json);
			
			// if there is a restriction, add it to the beginning of the json data
			if($restrict_categories) {
				$restrict = '"_restrict":'.$categories_result.',';
				$json_data = substr_replace($json_data, $restrict, strpos($json_data, '{')+1, 0);
			}
			
			echo $json_data;			
			break;
		case 'getSnapshots':
			if(!post_isset('documentID')) break;
			dbg_set('documentID');
			
			$json = array();
			// TODO: escape and check
			$result = db::query('select id, creation_date from snapshots where document = '.$_POST['documentID']);
			foreach ($result as $row) {
				$json[$row['id']] = array('creation_date' => $row['creation_date']);
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
			if(!post_isset('snapshotID')) break;
			dbg_set('snapshotID');
			
			// TODO: escape and check
			$result = db::query('select data from snapshots where id = '.$_POST['snapshotID'].' limit 1');
			echo $result;
			break;
		default: break;
	}
	
	db::disconnect();
}