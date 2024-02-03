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

define("PLUGIN_PATH", plugin_dir_path(__FILE__));
define("PLUGIN_URL", plugin_dir_url(__FILE__));
define("PLUGIN", plugin_basename(__FILE__));

use Inc\Base\Activate;
use Inc\Base\Deactivate;

function korekthor_activate() {
  Activate::activate();
}

function korekthor_deactivate() {
  Deactivate::deactivate();
}

register_activation_hook(__FILE__, "korekthor_activate");
register_deactivation_hook(__FILE__, "korekthor_deactivate");

if (class_exists("Inc\\Init")) {
  Inc\Init::register_services();
}
