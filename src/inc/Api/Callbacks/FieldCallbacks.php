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

  public function text_field($args) {
    $name = $args["label_for"];
    $class = $args["class"];
    $placeholder = $args["placeholder"];
    $text = get_option($name);

  ?>
    <input type="text" name="<?= $name ?>" value="<?= $text ?>" class="<?= $class ?>" placeholder="<?= $placeholder ?>">
  <?
  }

  public function textarea_field($args) {
    $name = $args["label_for"];
    $class = $args["class"];
    $placeholder = $args["placeholder"];
    $content = get_option($name);
    $rows = isset($args["rows"]) ? $args["rows"] : 5;
  ?>
    <textarea rows="<?= $rows ?>" name="<?= $name ?>" class="regular-text <?= $class ?>" placeholder="<?= $placeholder ?>"><?= $content ?></textarea>
<?
  }
}
