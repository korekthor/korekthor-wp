<?

/**
 * @package korekthor
 */

namespace Inc\TapIns;

use Inc\Base\BaseController;
use Inc\Base\KorekthorApiController;
use Inc\Utils;

class ClassicEditor extends BaseController {
  private $utils;

  public function register() {
    // if the plugin is not active, do not register the hooks
    $this->utils = new Utils();

    add_action(
      "admin_enqueue_scripts",
      array($this, "enqueue_assets"),
    );
    add_action("add_meta_boxes", array($this, "add_korekthor_meta_box"));
  }

  public function enqueue_assets() {
    if (!Utils::is_classic_editor()) return;

    $this->utils->enqueue_assets("classic", "korekthor_classic_editor");
    $this->utils->localize_editor_script("korekthor_classic_editor");
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
    $plugin_url = $this->plugin_url;
    return require_once "$this->plugin_path/templates/ClassicEditorMetaBox.php";
  }
}
