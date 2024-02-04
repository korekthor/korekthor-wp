<?php

/**
 * @package korekthor
 */

namespace Inc\Api\Callbacks;

use Inc\Base\BaseController;

class AdminCallbacks extends BaseController {
  public function admin_dashboard() {
    return require_once "$this->plugin_path/templates/admin.php";
  }

  public function admin_settings() {
    return require_once "$this->plugin_path/templates/settings.php";
  }

  public function korekthor_options_group($input) {
    return $input;
  }

  public function korekthor_admin_section() {
    echo "Spravovat nastavení Korekthoru pro WordPress";
  }
}
