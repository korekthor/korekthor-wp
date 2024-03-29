<?

/**
 * @package korekthor
 */

namespace Inc\TapIns;

use Inc\Base\AjaxController;
use Inc\Base\BaseController;
use Inc\Base\KorekthorApiController;
use Inc\Utils;

class GutenbergEditor extends BaseController {
  private $utils;
  public function register() {
    // if the plugin is not active, do not register the hooks
    $this->utils = new Utils();

    add_action(
      "enqueue_block_editor_assets",
      array($this, "enqueue_editor_assets"),
    );
  }
  public function enqueue_editor_assets() {
    $this->utils->enqueue_assets("editor", "korekthor_gutenberg_editor");
    $this->utils->localize_editor_script("korekthor_gutenberg_editor");
  }
}
