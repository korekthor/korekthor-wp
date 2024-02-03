<?php

/* 
 * @package korekthor
 */

namespace Inc\Pages;

use \Inc\Base\BaseController;

class Admin extends BaseController {
  public function register() {
    add_action("admin_menu", array($this, "add_admin_pages"));
  }

  function add_admin_pages() {
    $logo = "data:image/svg+xml;base64," . base64_encode(file_get_contents($this->plugin_path . "assets/logo.svg"));

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

  function admin_index() {
    require_once $this->plugin_path . "templates/admin.php";
  }
}
