<?

/**
 * @package korekthor
 */

namespace Inc\Base;

class AjaxController {
  public static $korekthor_nonce;

  public function register() {
    // set nonce
    add_action("init", array($this, "create_nonce"));
    add_action("wp_ajax_korekthor_correction", array($this, "correct_text"));
    add_action("wp_ajax_korekthor_update_dictionaries", array($this, "update_dictionaries"));
  }

  public function create_nonce() {
    self::$korekthor_nonce = wp_create_nonce("korekthor_req");
  }

  public function update_dictionaries() {
    var_dump($_POST);
    check_ajax_referer("korekthor_req", "nonce");
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
