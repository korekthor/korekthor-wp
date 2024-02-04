<?php

/* 
 * @package korekthor
 */

namespace Inc\Pages;

use Inc\Api\Callbacks\FieldCallbacks;
use \Inc\Api\SettingsApi;
use \Inc\Base\BaseController;
use \Inc\Api\Callbacks\AdminCallbacks;

class Settings extends BaseController {
  public $settings;

  public $callbacks;
  public $fields;

  public function register() {
    $this->settings = new SettingsApi();
    $this->callbacks = new AdminCallbacks();
    $this->fields = new FieldCallbacks();


    $this->set_settings();
    $this->set_sections();
    $this->set_fields();
    $this->settings->register();
  }

  public function set_settings() {
    $args = [
      [
        "option_group" => "korekthor_options_group",
        "option_name" => "korekthor_enable",
        "callback" => [
          "sanitize_callback" => array($this->fields, "checkbox_sanitize"),
          "default" => true,
          "type" => "boolean",
          "description" => "Povolit korekthor na tomto webu.",
        ],
      ],
      [
        "option_group" => "korekthor_options_group",
        "option_name" => "korekthor_api_key",
        "callback" => array($this->callbacks, "korekthor_options_group"),
      ],
    ];

    $this->settings->set_settings($args);
  }

  public function set_sections() {
    $args = [
      [
        "id" => "korekthor_admin_api",
        "title" => "Nastavení API",
        "callback" => array($this->callbacks, "korekthor_admin_section"),
        "page" => "korekthor_settings",
      ]
    ];

    $this->settings->set_sections($args);
  }

  public function set_fields() {
    $args = [
      [
        "id" => "korekthor_api_key",
        "title" => "API klíč",
        "callback" => array($this->fields, "textarea_field"),
        "page" => "korekthor_settings",
        "section" => "korekthor_admin_api",
        "args" => [
          "label_for" => "korekthor_api_key",
          "class" => "example-class",
          "placeholder" => "Tady vložte váš API klíč..."
        ]
      ],
      [
        "id" => "korekthor_enable",
        "title" => "Povolit korekthor",
        "callback" => array($this->fields, "checkbox_field"),
        "page" => "korekthor_settings",
        "section" => "korekthor_admin_api",
        "args" => [
          "label_for" => "korekthor_enable",
          "class" => "ui-toggle",
        ]
      ]
    ];

    $this->settings->set_fields($args);
  }
}