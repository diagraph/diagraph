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
	// for debugging
	if (!isset($_GET['documentID'])) {
		header('Location: ?documentID=1');
	}
	// display the html page
	include_once 'html/template.phtml';
}
else {
	dbg_set('task');
	
	db::connect();
	
	switch ($_POST['task']) {
		case 'loadCategories':
			// TODO: move in seperate class
			dbg_set('documentID');
			
			// check if the document restricts the visible categories
			$categories_result = json_decode(db::query('select categories from documents where id = '.db::value($_POST['documentID']).' limit 1'), true);
			
			$json = array();
			$result = db::query('SELECT id, name FROM categories');
			foreach ($result as $row) {
				// category objects
				$result2 = db::query('SELECT name, data, path FROM objects WHERE category = '.$row['id']);
				$elements = array();
				foreach ($result2 as $row2) {
					if ($row2['data'] == 'path') {
						$elements[$row2['name']] = $row2['path'];
					}
					else {
						$elements[$row2['name']] = $row2['data'];
					}
				}
				$json[$row['name']] = array('id'=>$row['id'], 'show'=>false, 'elements'=>$elements);
				if (in_array($row['id'], $categories_result)) {
					$json[$row['name']]['show'] = true;
				}
			}
			echo json_encode($json);
			break;
		case 'saveCategories':
			if(!isset($_POST['categories'])) {
				echo "-1";
				break;
			}
			
			$data = stripslashes($_POST['categories']);
			
			$result = db::query('UPDATE documents SET categories = '.db::value($data).' WHERE id = '.db::value($_POST['documentID']));
			echo $result[0];
			
			break;
		case 'getSnapshots':
			if(!post_isset('documentID')) break;
			dbg_set('documentID');
			
			$json = array();
			$json['snapshots'] = array();
			$result = db::query('select id, creation_date from snapshots where document = '.db::value($_POST['documentID']).' order by id desc');
			foreach ($result as $row) {
				array_push($json['snapshots'], array('id' => $row['id'], 'creation_date' => $row['creation_date']));
			}
			echo json_encode($json);
			
			break;
		case 'saveSnapshot':
			if(!isset($_POST['documentData'])) {
				echo "-1";
				break;
			}
			
			$data = stripslashes($_POST['documentData']);
			
			$result = db::query('insert into snapshots values (default, 1, default, '.db::value($data).')');
			echo $result[0];
			
			break;
		case 'loadSnapshot':
			if(!post_isset('snapshotID')) break;
			dbg_set('snapshotID');
			
			if($_POST['snapshotID'] == -1) {
				// find latest snapshot
				$_POST['snapshotID'] = db::query('select id from snapshots order by id desc limit 1');
			}
			
			$result = db::query('select data from snapshots where id = '.db::value($_POST['snapshotID']).' limit 1');
			if (!$result) {
				$result = json_encode(array('objects'=>array()));
			}
			echo $result;
			break;
		default: break;
	}
	
	db::disconnect();
}