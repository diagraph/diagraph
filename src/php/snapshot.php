<?php

class Snapshot {
	
	public static function getList(Document $document) {
		return db::query('SELECT id, creation_date FROM snapshots WHERE document = '.db::value($document->getId()).' ORDER BY creation_date DESC');
	}
	
	public static function create(Document $document, array $data, $timestamp = null) {
		// check timestamp
		if (!$timestamp) {
			$timestamp = time();
		}
		else {
			$timestamp = filter_var($timestamp, FILTER_SANITIZE_NUMBER_INT);
			if ($timestamp > time()) {
				$timestamp = time();
			}
			$last = db::query('SELECT UNIX_TIMESTAMP(creation_date) FROM snapshots WHERE document = '.db::value($document->getId()).' ORDER BY creation_date DESC LIMIT 1');
			if ($last && $last > $timestamp) {
				$timestamp = $last;
			}
		}
		
		db::query('INSERT INTO snapshots (document, data, creation_date) values ('.db::value($document->getId()).', '.db::value(json_encode($data)).', FROM_UNIXTIME('.db::value($timestamp).'))');
	}
	
	public static function getData(Document $document, $id) {
		if ($id == -1) {
			// find latest snapshot
			$id = db::query('SELECT id FROM snapshots WHERE document = '.db::value($document->getId()).' ORDER BY id DESC LIMIT 1');
		}
		else {
			$id = filter_var($id, FILTER_SANITIZE_NUMBER_INT);
		}
		
		$result = db::query('SELECT data FROM snapshots WHERE id = '.db::value($id).' LIMIT 1');
		if (!$result) {
			return json_encode(array('objects'=>array()));
		}
		return $result;
	}
	
	public static function delete(Document $document, $id = null) {
		$extra = '';
		if ($id) {
			$extra = ' AND id = '.db::value($id);
		}
		db::query('DELETE FROM snapshots WHERE document = '.db::value($document->getId()).$extra);
	}
	
	public static function copy(Document $from, Document $to) {
		db::query('INSERT INTO snapshots (document, creation_date, data) SELECT '.db::value($to->getId()).', creation_date, data FROM snapshots WHERE document = '.db::value($from->getId()));
	}
	
	public static function export(Document $document) {
		$json = db::query('SELECT id, creation_date, data FROM snapshots WHERE document = '.db::value($document->getId()).' ORDER BY creation_date DESC');
		foreach ($json as $i => $row) {
			$json[$i]['data'] = json_decode($row['data']);
		}
		return $json;
	}
}