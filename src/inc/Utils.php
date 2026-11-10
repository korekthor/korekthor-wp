<?php

/**
 * @package korekthor
 */

namespace Inc;

use Inc\Base\AjaxController;
use Inc\Base\BaseController;
use Inc\Base\KorekthorApiController;

class Utils extends BaseController {
  public static function is_classic_editor() {
    global $pagenow;

    if ($pagenow === 'post.php' || $pagenow === 'post-new.php') {
      $current_screen = get_current_screen();

      if (method_exists($current_screen, 'is_block_editor') && !$current_screen->is_block_editor()) {
        return true;
      }
    }

    return false;
  }

  public function enqueue_assets($filename, $name) {
    $editor_asset_file = include($this->plugin_path . "assets/$filename.asset.php");

    wp_enqueue_script(
      $name,
      $this->plugin_url . "assets/$filename.js",
      $editor_asset_file["dependencies"],
      $editor_asset_file["version"],
    );

    wp_enqueue_style("korekthor_editor", $this->plugin_url . "assets/$filename.css", array(), $editor_asset_file["version"]);
  }

  public function localize_editor_script($name) {
    $dictionaries = KorekthorApiController::get_dictionaries();

    $dictionaries_data = isset($dictionaries['data']) ? $dictionaries['data'] : [];
    $error_codes_res = KorekthorApiController::get_error_codes();
    $warning_codes_res = KorekthorApiController::get_warning_codes();

    wp_localize_script(
      $name,
      "korekthor_ajax",
      array(
        "nonce" => AjaxController::$korekthor_nonce ?: wp_create_nonce("korekthor_req"),
        "plugin_url" => $this->plugin_url,
        "dictionaries" => $dictionaries_data,
        "dictionaries_error" => $dictionaries['error'] ?? null,
        "dictionaries_selected" => get_user_meta(get_current_user_id(), "korekthor_dictionaries", true),
        "error_codes" => isset($error_codes_res["errors"]) ? $error_codes_res["errors"] : [],
        "warning_codes" => isset($warning_codes_res["warnings"]) ? $warning_codes_res["warnings"] : (is_array($warning_codes_res) ? $warning_codes_res : []),
      ),
    );
  }
}
