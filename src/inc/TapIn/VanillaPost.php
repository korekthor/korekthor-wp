<?

/**
 * @package korekthor
 */

namespace Inc\TapIn;

class VanillaPost {
  public function register() {

    // if the plugin is not active, do not register the hooks
    if (!get_option("korekthor_enable")) return;

    add_action("add_meta_boxes", array($this, "add_meta_boxes"));
  }

  public function add_meta_boxes() {
    add_meta_box(
      "korekthor_vanilla_post_meta_box",
      "Korekthor",
      array($this, "add_vanilla_post_column"),
      "",
      "side",
    );
  }

  public function add_vanilla_post_column() {
?>
    <h1>Hello Korekthor!</h1>
<?
  }
}
