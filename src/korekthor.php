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

class KorekthorPlugin
{
  function activate()
  {
    require_once plugin_dir_path(__FILE__) . "inc/activate.php";
    KorekthorActivate::activate();
  }

  function deactivate()
  {
    require_once plugin_dir_path(__FILE__) . "inc/deactivate.php";
    KorekthorDeactivate::deactivate();
  }

  function register()
  {
    add_action("admin_enqueue_scripts", array($this, "enqueue"));
    add_action("admin_menu", array($this, "add_admin_pages"));
    add_filter("plugin_action_links_" . plugin_basename(__FILE__), array($this, "settings_link"));
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

  function settings_link($links)
  {
    $settings_link = '<a href="admin.php?page=korekthor">Nastavení</a>';
    array_push($links, $settings_link);
    return $links;
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
