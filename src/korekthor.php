<?php

/**
 * @package korekthor
 */


/*
Plugin Name: Korekthor pro WordPress
Plugin URI: https://korekthor.cz/ 
Description: Korekthor plugin pro WordPress - integrujte sílu korekthoru přímo do vašich stránek!
Version: 1.0.0
Author: Viktor Komárek
Author URI: https://vikithedev.eu/
License: GPLv2 or later
*/

// TODO: Add license

if (!defined("ABSPATH"))  die("(╯°□°）╯︵ ┻━┻ ");

if (file_exists(dirname(__FILE__) . "/vendor/autoload.php")) {
  require_once dirname(__FILE__) . "/vendor/autoload.php";
}


function korekthor_activate() {
  Inc\Base\Activate::activate();
}

function korekthor_deactivate() {
  Inc\Base\Deactivate::deactivate();
}

register_activation_hook(__FILE__, "korekthor_activate");
register_deactivation_hook(__FILE__, "korekthor_deactivate");

if (class_exists("Inc\\Init")) {
  Inc\Init::register_services();
}
