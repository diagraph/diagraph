<?php
	
	require_once 'global.php';
	require_once 'db.php';

	// TODO: <insert user authentication here>
	
	if(!isset($_POST['task']) && isset($_GET['task'])) {
		$_POST['task'] = $_GET['task'];
	}
	if(!isset($_POST['task'])) {
		$_POST['task'] = 'start';
	}
	
	db::connect();
	switch($_POST['task']) {
		case 'start':
			include_once '../html/importer.phtml';
			break;
		case 'getCategories':
			echo json_encode(db::query('select * from categories order by id'));
			break;
		case 'import':
			// get and check input
			$import_name = isset($_POST['import_name']) ? $_POST['import_name'] : '';
			$import_path = isset($_POST['import_text']) ? $_POST['import_text'] : '';
			$import_category = db::value(isset($_POST['import_category']) ? $_POST['import_category'] : '0');
			
			if(strlen($import_name) <= 0) {
				die('invalid object name');
			}
			
			if(strlen($import_path) <= 0) {
				die('invalid object path');
			}
			
			$import_category = filter_var($import_category, FILTER_SANITIZE_NUMBER_INT);
			if(!db::query('select id from categories where id = '.$import_category)) {
			   die('invalid category');
			}
			
			// and try insert:
			try {
				$result = db::query('insert into objects values (default, '.$import_category.', '.db::value($import_name).', "path", '.db::value($import_path).')');
				if(!$result) throw new Exception('query failed');
			}
			catch(Exception $e) {
				die('couldn\'t add object: '.$e->getMessage());
			}
			
			echo 'success';
			break;
		case 'addCategory':
			$category_name = isset($_POST['category_name']) ? $_POST['category_name'] : '';
			
			if(strlen($category_name) <= 0 || strlen($category_name) > 32) {
				die('invalid category name length');
			}
			
			if(db::query('select id from categories where name = '.db::value($category_name))) {
				die('category \''.$category_name.'\' already exists!');
			}
			
			// and try insert:
			try {
				$result = db::query('insert into categories values (default, '.db::value($category_name).')');
				if(!$result) throw new Exception('query failed');
			}
			catch(Exception $e) {
				die('couldn\'t add category: '.$e->getMessage());
			}
			
			echo 'success';
			break;
		default: break;
	}
	db::disconnect();
	
?>
