<?php

/**
 * @package korekthor
 */

namespace Inc\Api\Callbacks;

use Inc\Base\BaseController;
use Inc\Base\KorekthorApiController;

class AdminCallbacks extends BaseController {

  public function admin_dashboard() {
    $api_key = get_option("korekthor_api_key");
    $api_key_is_set = true;

    if (!$api_key) {
      $api_key_is_set = false;
    } else {
      $data = KorekthorApiController::get_company_data();
      if (isset($data["data"])) $company = $data["data"];
    }


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
