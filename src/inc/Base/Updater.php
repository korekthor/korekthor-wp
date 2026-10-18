<?php

/**
 * @package korekthor
 */

namespace Inc\Base;

class Updater extends BaseController {
  /**
   * Cache key for WordPress transient
   * @var string
   */
  private $cache_key = "korekthor_updater_info";

  /**
   * Plugin slug (e.g. 'korekthor')
   * @var string
   */
  private $plugin_slug = "korekthor";

  /**
   * Remote JSON metadata URL
   * @var string
   */
  private $update_url;

  /**
   * Current plugin version
   * @var string
   */
  private $version;

  /**
   * In-memory cache for remote info within a single request
   * @var object|false|null
   */
  private $remote_info = null;

  public function register() {
    $this->plugin = defined("KOREKTHOR_PLUGIN_BASENAME")
      ? KOREKTHOR_PLUGIN_BASENAME
      : (plugin_basename(dirname(__FILE__, 3)) . "/korekthor.php");

    $slug = dirname($this->plugin);
    $this->plugin_slug = ($slug === "." || empty($slug)) ? "korekthor" : $slug;

    $this->update_url = defined("KOREKTHOR_UPDATE_URL")
      ? KOREKTHOR_UPDATE_URL
      : "https://korekthor.cz/korekthor-wp-info.json";

    if (defined("KOREKTHOR_VERSION")) {
      $this->version = KOREKTHOR_VERSION;
    } else {
      if (!function_exists("get_plugin_data")) {
        require_once ABSPATH . "wp-admin/includes/plugin.php";
      }
      $plugin_data = get_plugin_data($this->plugin_path . "korekthor.php", false, false);
      $this->version = isset($plugin_data["Version"]) ? $plugin_data["Version"] : "1.2.1";
    }

    // Hook into WordPress transient update checks
    add_filter("pre_set_site_transient_update_plugins", [$this, "check_update"]);
    add_filter("site_transient_update_plugins", [$this, "check_update"]);

    // Hook into plugin information modal ("View version details")
    add_filter("plugins_api", [$this, "plugin_info"], 20, 3);

    // Clear transient cache on successful plugin upgrade
    add_action("upgrader_process_complete", [$this, "purge_cache"], 10, 2);
  }

  /**
   * Check for plugin updates against remote JSON endpoint
   *
   * @param object $transient
   * @return object
   */
  public function check_update($transient) {
    if (empty($transient) || !is_object($transient)) {
      return $transient;
    }

    if (!isset($transient->response) || !is_array($transient->response)) {
      $transient->response = [];
    }

    if (!isset($transient->no_update) || !is_array($transient->no_update)) {
      $transient->no_update = [];
    }

    $remote = $this->get_remote_info();
    if (!$remote || empty($remote->version)) {
      return $transient;
    }

    // Build update payload
    $res = new \stdClass();
    $res->id = $this->plugin;
    $res->slug = $this->plugin_slug;
    $res->plugin = $this->plugin;
    $res->new_version = $remote->version;
    $res->url = !empty($remote->homepage) ? $remote->homepage : "https://korekthor.cz";
    $res->package = !empty($remote->download_url) ? $remote->download_url : "https://korekthor.cz/korekthor-wp.zip";
    $res->tested = !empty($remote->tested) ? $remote->tested : "";
    $res->requires = !empty($remote->requires) ? $remote->requires : "";
    $res->requires_php = !empty($remote->requires_php) ? $remote->requires_php : "";

    if (!empty($remote->icons)) {
      $res->icons = (array) $remote->icons;
    }
    if (!empty($remote->banners)) {
      $res->banners = (array) $remote->banners;
    }

    if (version_compare($this->version, $remote->version, "<")) {
      $transient->response[$this->plugin] = $res;
      unset($transient->no_update[$this->plugin]);
    } else {
      $res->package = "";
      $transient->no_update[$this->plugin] = $res;
      unset($transient->response[$this->plugin]);
    }

    return $transient;
  }

  /**
   * Provide plugin information for the thickbox modal popup ("View version details")
   *
   * @param false|object $res
   * @param string $action
   * @param object $args
   * @return false|object
   */
  public function plugin_info($res, $action, $args) {
    if ($action !== "plugin_information") {
      return $res;
    }

    if (!isset($args->slug) || $args->slug !== $this->plugin_slug) {
      return $res;
    }

    $remote = $this->get_remote_info();
    if (!$remote) {
      return $res;
    }

    $info = new \stdClass();
    $info->name = !empty($remote->name) ? $remote->name : "Korekthor pro WordPress";
    $info->slug = $this->plugin_slug;
    $info->version = $remote->version;
    $info->author = !empty($remote->author) ? $remote->author : '<a href="https://korekthor.cz">Korekthor</a>';
    $info->author_profile = !empty($remote->author_profile) ? $remote->author_profile : "https://korekthor.cz";
    $info->homepage = !empty($remote->homepage) ? $remote->homepage : "https://korekthor.cz";
    $info->requires = !empty($remote->requires) ? $remote->requires : "5.0";
    $info->tested = !empty($remote->tested) ? $remote->tested : "6.7";
    $info->requires_php = !empty($remote->requires_php) ? $remote->requires_php : "7.0";
    $info->download_link = !empty($remote->download_url) ? $remote->download_url : "https://korekthor.cz/korekthor-wp.zip";
    $info->trunk = $info->download_link;
    $info->last_updated = !empty($remote->last_updated) ? $remote->last_updated : "";

    $sections = [];
    if (!empty($remote->sections)) {
      foreach ((array) $remote->sections as $key => $val) {
        $sections[$key] = $val;
      }
    } else {
      $sections["description"] = !empty($remote->description)
        ? $remote->description
        : "Plugin pro kontrolu pravopisu na WordPressu.";
      if (!empty($remote->changelog)) {
        $sections["changelog"] = $remote->changelog;
      }
    }
    $info->sections = $sections;

    if (!empty($remote->banners)) {
      $info->banners = (array) $remote->banners;
    }
    if (!empty($remote->icons)) {
      $info->icons = (array) $remote->icons;
    }

    return $info;
  }

  /**
   * Clear cache when plugin is updated
   *
   * @param object $upgrader_object
   * @param array $options
   */
  public function purge_cache($upgrader_object, $options) {
    if (
      isset($options["action"], $options["type"]) &&
      $options["action"] === "update" &&
      $options["type"] === "plugin"
    ) {
      if (isset($options["plugins"]) && is_array($options["plugins"])) {
        if (in_array($this->plugin, $options["plugins"], true)) {
          delete_transient($this->cache_key);
          $this->remote_info = null;
        }
      } else {
        delete_transient($this->cache_key);
        $this->remote_info = null;
      }
    }
  }

  /**
   * Fetch remote plugin metadata from URL with transient caching
   *
   * @return object|false
   */
  private function get_remote_info() {
    if ($this->remote_info !== null) {
      return $this->remote_info;
    }

    global $pagenow;
    $force_check = ($pagenow === "update-core.php" && !empty($_GET["force-check"]));

    if (!$force_check) {
      $cached = get_transient($this->cache_key);
      if ($cached !== false && is_object($cached)) {
        $this->remote_info = $cached;
        return $this->remote_info;
      }
    }

    $response = wp_remote_get($this->update_url, [
      "timeout" => 10,
      "headers" => [
        "Accept" => "application/json",
        "User-Agent" => "WordPress/" . get_bloginfo("version") . "; " . home_url(),
      ],
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
      return false;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body);

    if (!is_object($data) || empty($data->version)) {
      return false;
    }

    set_transient($this->cache_key, $data, 6 * HOUR_IN_SECONDS);
    $this->remote_info = $data;

    return $this->remote_info;
  }
}
