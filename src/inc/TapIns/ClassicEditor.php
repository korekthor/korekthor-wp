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
    if (!get_option("korekthor_enable")) return;

    $this->utils = new Utils();

    add_action("add_meta_boxes", array($this, "add_korekthor_meta_box"));
  }

  public function load_assets() {
    if (!Utils::is_classic_editor()) return;

    $this->utils->load_assets("classic", "korekthor_classic_editor");
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
?>
    <div>
      <div id="main">
        Tady se budou dít veliké věci
      </div>

      <template id="korekthor-classic-idle">
        <div class="korekthor-classic-idle">
          <p>Není opraven žádný text, pro opravu klikněte na tlačítko "Zkontrolovat článek". To opraví celý obsah tohoto článku.</p>
          <button class="button button-primary button-large" id="korekthor-check-button">
            Zkontrolovat článek
          </button>
        </div>
      </template>
    </div>
<?
  }
}
