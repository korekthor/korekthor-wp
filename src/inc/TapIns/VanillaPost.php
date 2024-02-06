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
    add_action("wp_ajax_korekthor_update_dictionaries", array($this, "update_dictionaries"));
  }
  public function enqueue_editor_assets() {
    $editor_asset_file = include($this->plugin_path . "assets/editor.asset.php");

    wp_enqueue_script(
      "korekthor_editor",
      $this->plugin_url . "assets/editor.js",
      $editor_asset_file["dependencies"],
      $editor_asset_file["version"],
    );

    wp_enqueue_style("korekthor_editor", $this->plugin_url . "assets/editor.css");

    $korekthor_nonce = wp_create_nonce("korekthor_req");

    $dictionaries = KorekthorApiController::get_dictionaries();

    wp_localize_script(
      "korekthor_editor",
      "korekthor_ajax",
      array(
        "nonce" => $korekthor_nonce,
        "update_dictionaries_nonce" => wp_create_nonce("korekthor_update_dictionaries"),
        "plugin_url" => $this->plugin_url,
        "dictionaries" => $dictionaries['data'],
        "dictionaries_error" => $dictionaries['error'] ?? null,
        "dictionaries_selected" => get_user_meta(get_current_user_id(), "korekthor_dictionaries", true)
      ),
    );

    // wp_enqueue_style("korekthor_editor", $this->plugin_url . "assets/editor.css");
  }

  public function update_dictionaries() {
    var_dump($_POST);
    check_ajax_referer("korekthor_update_dictionaries", "nonce");
    echo ("here");

    $dictionaries = $_POST["dictionaries"];

    update_user_meta(get_current_user_id(), "korekthor_dictionaries", $dictionaries);

    wp_send_json(array("success" => true));
  }

  public function correct_text() {
    check_ajax_referer("korekthor_req", "nonce");

    $text = $_POST["text"];
    $dictionaries = $_POST["dictionaries"];

    $response = KorekthorApiController::correct_text($text, $dictionaries);

    wp_send_json($response);
  }
}
