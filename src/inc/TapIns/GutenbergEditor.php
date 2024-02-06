<?

/**
 * @package korekthor
 */

namespace Inc\TapIns;

use Inc\Base\AjaxController;
use Inc\Base\BaseController;
use Inc\Base\KorekthorApiController;

class GutenbergEditor extends BaseController {
  public function register() {

    // if the plugin is not active, do not register the hooks
    if (!get_option("korekthor_enable")) return;

    add_action(
      "enqueue_block_editor_assets",
      array($this, "enqueue_editor_assets"),
    );
  }
  public function enqueue_editor_assets() {
    $editor_asset_file = include($this->plugin_path . "assets/editor.asset.php");

    wp_enqueue_script(
      "korekthor_editor",
      $this->plugin_url . "assets/editor.js",
      $editor_asset_file["dependencies"],
      $editor_asset_file["version"],
    );

    wp_enqueue_style("korekthor_editor", $this->plugin_url . "assets/editor.css", array(), $editor_asset_file["version"]);

    $dictionaries = KorekthorApiController::get_dictionaries();

    wp_localize_script(
      "korekthor_editor",
      "korekthor_ajax",
      array(
        "nonce" => AjaxController::$korekthor_nonce,
        "plugin_url" => $this->plugin_url,
        "dictionaries" => $dictionaries['data'],
        "dictionaries_error" => $dictionaries['error'] ?? null,
        "dictionaries_selected" => get_user_meta(get_current_user_id(), "korekthor_dictionaries", true)
      ),
    );

    // wp_enqueue_style("korekthor_editor", $this->plugin_url . "assets/editor.css");
  }
}
