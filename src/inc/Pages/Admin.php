<?php

/* 
 * @package korekthor
 */

namespace Inc\Pages;

use Inc\Api\Callbacks\FieldCallbacks;
use \Inc\Api\SettingsApi;
use \Inc\Base\BaseController;
use \Inc\Api\Callbacks\AdminCallbacks;

class Admin extends BaseController {
  public $settings;
  public $pages;
  public $subpages;
  public $callbacks;
  public $fields;

  public function register() {
    $this->settings = new SettingsApi();
    $this->callbacks = new AdminCallbacks();
    $this->fields = new FieldCallbacks();

    $this->set_pages();

    $this->set_settings();
    $this->set_sections();
    $this->set_fields();

    $this->settings
      ->add_pages($this->pages)
      ->with_subpage("Přehled")
      ->add_subpages($this->subpages)
      ->register();
  }

  public function set_pages() {
    $logo = "data:image/svg+xml;base64," . base64_encode(file_get_contents($this->plugin_path . "assets/logo.svg"));

    $this->pages = [
      [
        'page_title' => 'Korekthor pro WordPress',
        'menu_title' => 'Korekthor',
        'capability' => 'manage_options',
        'menu_slug' => 'korekthor',
        'callback' => array($this->callbacks, 'admin_dashboard'),
        'icon_url' => $logo,
        'position' => 110
      ]
    ];

    $this->subpages = [
      [
        "parent_slug" => "korekthor",
        "page_title" => "Nastavení",
        "menu_title" => "Nastavení",
        "capability" => "manage_options",
        "menu_slug" => "korekthor_settings",
        "callback" => array($this->callbacks, 'admin_settings'),
      ],
      [
        "parent_slug" => "korekthor",
        "page_title" => "Stránka firmy",
        "menu_title" => "Stránka firmy",
        "capability" => "manage_options",
        "menu_slug" => "korekthor_company",
        "callback" => function () {
          echo '<h1>Stránka firmy Korekthor</h1>';
        }
      ]
    ];
  }

  public function set_settings() {
    $args = [
      [
        "option_group" => "korekthor_options_group",
        "option_name" => "korekthor_enable",
        "callback" => array($this->fields, "checkbox_sanitize"),
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
        "callback" => array($this->callbacks, "korekthor_api_key"),
        "page" => "korekthor_settings",
        "section" => "korekthor_admin_api",
        "args" => [
          "label_for" => "korekthor_api_key",
          "class" => "example-class",
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
