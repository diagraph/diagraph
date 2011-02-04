<?php

require_once 'config.inc.php';


/**
 * autoload feature for classes
 * @param string $class_name
 */
function __autoload($class_name)
{
    include_once "php/".strtolower(str_replace("_", "/", $class_name)).".php";
}