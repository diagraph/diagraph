<?php

require_once 'php/global.php';

db::connect();

$user = new User(1);

if (!isset($_POST['task'])) {
	// check db version
	$db_version = db::query('select db_version from base limit 1');
	if($db_version != config::db_version) {
		die("DB version mismatch: DB: v".$db_version." != PHP: v".config::db_version);
	}
	
	if (!isset($_GET['documentID'])) {
		include_once 'html/list.phtml';
	}
	else {
		// display the html page
		include_once 'html/document.phtml';
	}
}
else {
	switch ($_POST['task']) {
		case 'loadCategories':
			$document = Document::fromDatabase($_POST['documentID']);
			echo json_encode($document->getCategories());
			break;
			
		case 'saveCategories':
			$document = Document::fromDatabase($_POST['documentID']);
			$document->changeCategories(json_decode(stripslashes($_POST['categories']), true));
			break;
			
		case 'getSnapshots':
			$document = Document::fromDatabase($_POST['documentID']);
			echo json_encode(Snapshot::getList($document));
			break;
			
		case 'saveSnapshot':
			$document = Document::fromDatabase($_POST['documentID']);
			Snapshot::create($document, json_decode(stripslashes($_POST['documentData']), true), $_POST['timestamp']);
			break;
			
		case 'loadSnapshot':
			$document = Document::fromDatabase($_POST['documentID']);
			echo Snapshot::getData($document, $_POST['snapshotID']);
			break;

		case 'deleteDocument':
			$document = Document::fromDatabase($_POST['id']);
			$document->delete();
			break;
		
		case 'loadDocuments':
			echo json_encode(Document::getList(Document::FORMAT_JSON));
			break;
		
		case 'createDocument':
			$document = Document::create($_POST['name']);
			echo $document->getId();
			break;
		
		case 'renameDocument':
			$document = Document::fromDatabase($_POST['id']);
			$document->rename($_POST['newname']);
			break;
		
		case 'copyDocument':
			$document = Document::fromDatabase($_POST['id']);
			$newdoc = $document->copy($_POST['copyname']);
			echo json_encode($newdoc->toJSON());
			break;
			
		case 'exportDocument':
			$document = Document::fromDatabase($_POST['id']);
			
			header("Content-Type: text/plain");
			header("Content-Disposition: attachment; filename=\"".$document->getName().".vonline\"");
			
			echo json_encode($document->export());
			break;
			
		default: break;
	}
}

db::disconnect();