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

if (!defined("ABSPATH"))  die(" (╯°□°）╯︵ ┻━┻ ");

class KorekthorPlugin
{
  function activate()
  {
  }

  function deactivate()
  {
  }

  function uninstall()
  {
  }
}

if (class_exists("KorekthorPlugin"))
  $korekthorPlugin = new KorekthorPlugin();

//acivation
register_activation_hook(__FILE__, array($korekthorPlugin, "activate"));

//deactivation
register_deactivation_hook(__FILE__, array($korekthorPlugin, "deactivate"));
