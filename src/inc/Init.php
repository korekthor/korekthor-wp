<?php
/*
  * @package korekthor
  */

namespace Inc;

final class Init {
  /**
   * Store all the classes inside an array
   * @return array Full list of classes
   */
  public static function get_services() {
    return [
      Pages\Admin::class,
      Base\Enqueue::class,
      Base\SettingsLinks::class
    ];
  }

  /**
   * Initialize the class
   * @param class $class class from the services array
   * @return class instance new instance of the class
   */
  private static function instantiate($class) {
    return new $class();
  }

  /*
    * Loop through the classes, initialize them, and call the register() method if it exists
    * @return
    */
  public static function register_services() {
    foreach (self::get_services() as $class) {
      $service = self::instantiate($class);

      if (method_exists($service, "register")) {
        $service->register();
      }
    }
  }
}


// use Inc\Base\Activate;
// use Inc\Base\Deactivate;
// use Inc\Admin\Admin;

// class KorekthorPlugin
// {
//   public $plugin;

//   function __construct()
//   {
//     $this->plugin = plugin_basename(__FILE__);
//   }

//   function activate()
//   {
//     Activate::activate();
//   }

//   function deactivate()
//   {
//     Deactivate::deactivate();
//   }

//   function register()
//   {
//     add_action("admin_enqueue_scripts", array($this, "enqueue"));
//     add_filter("plugin_action_links_$this->plugin", array($this, "settings_link"));

//     Admin::add();
//   }

//   function settings_link($links)
//   {
//     $settings_link = '<a href="admin.php?page=korekthor">Nastavení</a>';
//     array_push($links, $settings_link);
//     return $links;
//   }

//   function enqueue()
//   {
//     wp_enqueue_style("korekthor-style", plugins_url("/assets/korekthor-client.css", __FILE__));
//     wp_enqueue_script("korekthor-script", plugins_url("/assets/korekthor-client.js", __FILE__));
//   }

//   function admin_index()
//   {
//     require_once plugin_dir_path(__FILE__) . "templates/admin.php";
//   }
// }

// if (class_exists("KorekthorPlugin")) {
//   $korekthorPlugin = new KorekthorPlugin();
//   $korekthorPlugin->register();
// }

// //acivation
// register_activation_hook(__FILE__, array($korekthorPlugin, "activate"));

// //deactivation
// register_deactivation_hook(__FILE__, array($korekthorPlugin, "deactivate"));
// // Admin::activate();