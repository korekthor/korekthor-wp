<?

/**
 * @package korekthor
 */

namespace Inc\TapIns;

use Inc\Utils;

class ClassicEditor {
  public function register() {
    // if the plugin is not active, do not register the hooks
    if (!get_option("korekthor_enable")) return;

    add_action("add_meta_boxes", array($this, "add_korekthor_meta_box"));
  }

  public function add_korekthor_meta_box() {
    if (!Utils::is_classic_editor()) return;

    add_meta_box(
      'korekthor_meta_box',
      'Korekthor',
      array($this, 'korekthor_meta_box_html')
    );
  }

  public function korekthor_meta_box_html() {
?>
    <div>
      Tady se budou dít veliké věci
    </div>
<?
  }
}
