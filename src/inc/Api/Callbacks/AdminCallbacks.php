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
    echo "Manage Korekthor settings";
  }

  public function korekthor_api_key() {
    $apikey = esc_attr(get_option("korekthor_api_key"));

    echo "<textarea type='text' class='regular-text' name='korekthor_api_key' placeholder='Tady vložte váš API klíč...' rows='5'>$apikey</textarea>";
  }
}
