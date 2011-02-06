<?php

class Document {
	
	private $id = null;
	private $name;
	private $creation_date;
	private $modification_date;
	private $categories;
	private static $standard_categories = array(1);
	
	const SORT_ID_ASC = 1;
	
	const FORMAT_JSON = 1;

	private function __construct($id) {
		$result = db::query('SELECT id, name, creation_date, categories, id as temp, (SELECT creation_date FROM snapshots WHERE document = temp ORDER BY creation_date DESC LIMIT 1) as modification_date FROM documents WHERE id = '.db::value($id).' LIMIT 1');
		$this->id = (int)$result['id'];
		$this->name = $result['name'];
		$this->creation_date = $result['creation_date'];
		$this->modification_date = $result['modification_date'];
		if (!$this->modification_date) {
			$this->modification_date = $result['creation_date'];
		}
		$this->categories = json_decode($result['categories'], true);
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function getCategories() {
		// check if the document restricts the visible categories
		$categories_result = json_decode(db::query('SELECT categories FROM documents WHERE id = '.db::value($this->id).' LIMIT 1'), true);
		
		$json = array();
		$result = db::query('SELECT id, name FROM categories');
		foreach ($result as $row) {
			// category objects
			$result2 = db::query('SELECT name, type, path FROM objects WHERE category = '.$row['id']);
			$elements = array();
			foreach ($result2 as $row2) {
				if ($row2['type'] == 'path') {
					$elements[$row2['name']] = $row2['path'];
				}
				else {
					$elements[$row2['name']] = $row2['type'];
				}
			}
			$json[$row['name']] = array('id'=>$row['id'], 'show'=>false, 'elements'=>$elements);
			if (in_array($row['id'], $categories_result)) {
				$json[$row['name']]['show'] = true;
			}
		}
		return $json;
	}
	
	public function changeCategories(array $categories) {
		// check array
		foreach ($categories as $key => $value) {
			$value = filter_var($value, FILTER_SANITIZE_NUMBER_INT);
			if ($value === false) {
				throw new Exception('wrong categories given');
			}
			$exists = db::query('SELECT 1 FROM categories WHERE id = '.db::value($value));
			if (!$exists) {
				throw new Exception('wrong categories given');
			}
			$categories[$key] = $value;
		}
		
		$data = json_encode($categories);
		
		$result = db::query('UPDATE documents SET categories = '.db::value($data).' WHERE id = '.db::value($this->id));
	}
	
	public function rename($newname) {
		global $user;
		
		db::query('UPDATE documents SET name = '.db::value($newname).' WHERE id = '.db::value($this->id).' AND author = '.db::value($user->getId()));
		$this->name = filter_var($newname, FILTER_SANITIZE_STRING);
	}
	
	public function delete() {
		db::query('DELETE FROM documents WHERE id = '.db::value($this->id));
		Snapshot::delete($this);
	}
	
	public function copy($copyname) {
		global $user;
		
		$copy = self::create($copyname);
		
		Snapshot::copy($this, $copy);
		
		return $copy;
	}
	
	public function toJSON() {
		return array('id'=>$this->id, 'name'=>$this->name, 'creation_date'=>$this->creation_date, 'modification_date'=>$this->modification_date);
	}
	
	public function export() {
		return array('name'=>$this->name, 'creation_date'=>$this->creation_date, 'categories'=>$this->categories, 'snapshots'=>Snapshot::export($this));
	}
	
	private function isAccessibleBy(user $user) {
		return (boolean)db::query('SELECT 1 FROM documents WHERE id = '.db::value($this->id).' AND author = '.$user->getId().' LIMIT 1');
	}
	
	public static function fromDatabase($id) {
		global $user;
		
		$id = filter_var($id, FILTER_SANITIZE_NUMBER_INT);
		if ($id === false) {
			throw new Exception('not an document id given');
		}
		$exists = db::query('SELECT 1 FROM documents WHERE id = '.db::value($id).' LIMIT 1');
		if (!$exists) {
			throw new Exception('no document with the given id exists');
		}
		
		$document = new Document($id);
		
		if (!$document->isAccessibleBy($user)) {
			throw new Exception('no document with the given id exists');
		}
		
		return $document;
	}
	
	public static function create($name) {
		global $user;
		
		$result = db::query('INSERT INTO documents (name, author, categories) VALUES ('.db::value($name).', '.db::value($user->getId()).', '.db::value(json_encode(self::$standard_categories)).')');
		return self::fromDatabase($result['insertid']);
	}
	
	public static function getList($type = self::FORMAT_JSON, $filter = null, $sorting = self::SORT_ID_ASC) {
		global $user;
		
		switch ($type) {
			case self::FORMAT_JSON:
				$list = array();
				$result = db::query('SELECT id FROM documents WHERE author = '.db::value($user->getId()));
				foreach ($result as $row) {
					$document = self::fromDatabase($row['id']);
					array_push($list, $document->toJSON());
				}
				return $list;
				break;
		}
	}
}