<?php
header("Content-Type: text/cache-manifest");
?>
CACHE MANIFEST
<?php
function recursive_list_dirs($dir) {
	$list = scandir($dir);
	foreach ($list as $obj) {
		if ($obj == '.' || $obj == '..' || strpos($obj, '.') === 0) {
			continue;
		}
		if (is_dir($dir.'/'.$obj)) {
			recursive_list_dirs($dir.'/'.$obj);
		}
		else {
			print $dir.'/'.$obj.PHP_EOL;
		}
	}
}

$dirs = array('css', 'images', 'js');
foreach ($dirs as $dir) {
	recursive_list_dirs($dir);
}