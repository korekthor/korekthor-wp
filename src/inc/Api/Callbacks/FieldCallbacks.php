<?php

/**
 * @package korekthor
 */

namespace Inc\Api\Callbacks;

use Inc\Base\BaseController;

class FieldCallbacks extends BaseController {
  public function checkbox_sanitize($input) {
    return (isset($input) ? true : false);
  }

  public function checkbox_field($args) {
    $name = $args["label_for"];
    $class = $args["class"];
    $checkbox = get_option($name);

?>
    <input type="checkbox" name="<?= $name ?>" value="1" class="<?= $class ?>" <?= $checkbox ? "checked" : "" ?>>
<?
  }
}
