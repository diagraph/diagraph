<?php

if (!isset($_POST['task'])) {
	// display the html page
	include_once 'html/template.phtml';
}
else {
	switch ($_POST['task']) {
		// e.g. save, load, etc
	}
}