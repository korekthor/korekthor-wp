<?

/**
 * @package korekthor
 */

namespace Inc\TapIns;

use Inc\Base\BaseController;
use Inc\Base\KorekthorApiController;

class VanillaPost extends BaseController {
  public function register() {

    // if the plugin is not active, do not register the hooks
    if (!get_option("korekthor_enable")) return;

    add_action(
      "enqueue_block_editor_assets",
      array($this, "enqueue_editor_assets"),
    );

    add_action("wp_ajax_korekthor_correction", array($this, "correct_text"));
  }
  public function enqueue_editor_assets() {
    $editor_asset_file = include($this->plugin_path . "assets/editor.asset.php");

    wp_enqueue_script(
      "korekthor_editor",
      $this->plugin_url . "assets/editor.js",
      $editor_asset_file["dependencies"],
      $editor_asset_file["version"],
    );

    $korekthor_nonce = wp_create_nonce("korekthor_req");

    wp_localize_script(
      "korekthor_editor",
      "korekthor_ajax",
      array(
        "nonce" => $korekthor_nonce,
      ),
    );

    // wp_enqueue_style("korekthor_editor", $this->plugin_url . "assets/editor.css");
  }

  public function correct_text() {
    check_ajax_referer("korekthor_req", "nonce");

    $text = $_POST["text"];

    $response = KorekthorApiController::correct_text($text);

    wp_send_json($response);
  }
}
