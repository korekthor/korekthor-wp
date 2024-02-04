<?

/**
 * @package korekthor
 */

namespace Inc\Pages;

use Inc\Api\Callbacks\AdminCallbacks;
use Inc\Api\SettingsApi;
use Inc\Base\BaseController;

class Dashboard extends BaseController {
  public $callbacks;
  public $pages;
  public $subpages;
  public $settings;
  public $api_controller;

  public function register() {
    $this->callbacks = new AdminCallbacks();
    $this->settings = new SettingsApi();
    $this->set_pages();

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
}
