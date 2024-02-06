<?

/**
 * @package korekthor
 */

namespace Inc;

class Utils {
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
}
