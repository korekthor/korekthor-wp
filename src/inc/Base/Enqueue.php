<?php

namespace Inc\Base;

class Enqueue {
  public function register() {
    add_action("admin_enqueue_scripts", array($this, "enqueue"));
  }

  function enqueue() {
    // enqueue all our scripts
    wp_enqueue_style("korekthorstyle", PLUGIN_URL . "assets/style.css");
    wp_enqueue_script("korekthorscript", PLUGIN_URL  . "assets/script.js");
  }
}
