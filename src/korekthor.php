<?php

/**
 * @package korekthor
 */

use Inc\Activate;
use Inc\Deactivate;

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

class KorekthorPlugin
{
  public $plugin;

  function __construct()
  {
    $this->plugin = plugin_basename(__FILE__);
  }

  function activate()
  {
    Activate::activate();
  }

  function deactivate()
  {
    Deactivate::deactivate();
  }

  function register()
  {
    add_action("admin_enqueue_scripts", array($this, "enqueue"));
    add_action("admin_menu", array($this, "add_admin_pages"));
    add_filter("plugin_action_links_$this->plugin", array($this, "settings_link"));
  }

  function settings_link($links)
  {
    $settings_link = '<a href="admin.php?page=korekthor">Nastavení</a>';
    array_push($links, $settings_link);
    return $links;
  }

  function enqueue()
  {
    wp_enqueue_style("korekthor-style", plugins_url("/assets/korekthor-client.css", __FILE__));
    wp_enqueue_script("korekthor-script", plugins_url("/assets/korekthor-client.js", __FILE__));
  }

  function add_admin_pages()
  {
    $logo = "data:image/svg+xml;base64," . base64_encode(file_get_contents(plugin_dir_path(__FILE__) . "/assets/logo.svg"));

    add_menu_page(
      "Korekthor pro WordPress",
      "Korekthor",
      "manage_options",
      "korekthor",
      array($this, "admin_index"),
      $logo,
      null
    );
  }

  function admin_index()
  {
    require_once plugin_dir_path(__FILE__) . "templates/admin.php";
  }
}

if (class_exists("KorekthorPlugin")) {
  $korekthorPlugin = new KorekthorPlugin();
  $korekthorPlugin->register();
}

//acivation
require_once plugin_dir_path(__FILE__) . "inc/activate.php";
register_activation_hook(__FILE__, array($korekthorPlugin, "activate"));

//deactivation
require_once plugin_dir_path(__FILE__) . "inc/deactivate.php";
register_deactivation_hook(__FILE__, array($korekthorPlugin, "deactivate"));
