<?php

/**
 * @package korekthor
 */

namespace Inc\Base;

class KorekthorApiController {
  public static function get_company_data($api_key = null) {
    $api_key = $api_key ?: get_option("korekthor_api_key");

    if (!$api_key) {
      return [
        "error" => "API klíč není nastaven.",
      ];
    }

    $response = wp_remote_get(KOREKTHOR_API_URL . "/company", [
      "timeout" => 5,
      "headers" => [
        "X-API-KEY" => $api_key,
      ],
    ]);

    if (is_wp_error($response)) {
      $error_msg = $response->get_error_message();
      return [
        "error" => "Nepodařilo se načíst data o firmě. Server odpověděl: <code>$error_msg</code>",
      ];
    }

    $status = wp_remote_retrieve_response_code($response);
    $decoded_body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status !== 200) {
      $error = "$status - " . (isset($decoded_body["error"]) ? $decoded_body["error"] : "Neznámá chyba.");

      return [
        "error" => "Nepodařilo se načíst data o firmě. API klíč může být neplatný. Server odpověděl: <code>$error</code>",
      ];
    }

    return [
      "data" => $decoded_body,
    ];
  }

  public static function get_dictionaries() {
    $cache_key = "korekthor_dictionaries_cache";
    $cached = get_transient($cache_key);
    if ($cached !== false && is_array($cached)) {
      return $cached;
    }

    $response = wp_remote_get(KOREKTHOR_API_URL . "/dictionary/plugin", [
      "timeout" => 5,
    ]);

    if (is_wp_error($response)) {
      $result = [
        "error" => "Odpoveď serveru: " . $response->get_error_message(),
      ];
      set_transient($cache_key, $result, MINUTE_IN_SECONDS);
      return $result;
    }

    $status = wp_remote_retrieve_response_code($response);
    $decoded_body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status !== 200) {
      $error = "$status - " . (isset($decoded_body["error"]) ? $decoded_body["error"] : "Neznámá chyba.");

      $result = [
        "error" => "Odpoveď serveru: $error",
      ];
      set_transient($cache_key, $result, MINUTE_IN_SECONDS);
      return $result;
    }

    $result = [
      "data" => $decoded_body,
    ];
    set_transient($cache_key, $result, HOUR_IN_SECONDS);

    return $result;
  }

  public static function get_error_codes() {
    $cache_key = "korekthor_error_codes_cache";
    $cached = get_transient($cache_key);
    if ($cached !== false && is_array($cached)) {
      return $cached;
    }

    $response = wp_remote_get("https://korekthor.cz/api/chyby", [
      "timeout" => 5,
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
      set_transient($cache_key, [], MINUTE_IN_SECONDS);
      return [];
    }

    $decoded = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($decoded)) {
      set_transient($cache_key, [], MINUTE_IN_SECONDS);
      return [];
    }

    set_transient($cache_key, $decoded, 6 * HOUR_IN_SECONDS);
    return $decoded;
  }

  public static function get_warning_codes() {
    $cache_key = "korekthor_warning_codes_cache";
    $cached = get_transient($cache_key);
    if ($cached !== false && is_array($cached)) {
      return $cached;
    }

    $response = wp_remote_get("https://korekthor.cz/api/varovani", [
      "timeout" => 5,
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
      set_transient($cache_key, [], MINUTE_IN_SECONDS);
      return [];
    }

    $decoded = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($decoded)) {
      set_transient($cache_key, [], MINUTE_IN_SECONDS);
      return [];
    }

    set_transient($cache_key, $decoded, 6 * HOUR_IN_SECONDS);
    return $decoded;
  }

  public static function correct_text($text, $dictionaries = []) {
    $api_key = get_option("korekthor_api_key");
    if (!$api_key) {
      return [
        "error" => "API klíč není nastaven.",
      ];
    }

    $encoded_body = json_encode([
      "text" => $text,
      "dictionaries" => $dictionaries,
    ]);

    $response = wp_remote_post(KOREKTHOR_API_URL . "/editor/company", [
      "headers" => [
        "X-API-KEY" => $api_key,
        "Content-Type" => "application/json",
      ],
      "body" => $encoded_body,
      "timeout" => 600,
    ]);

    $status = wp_remote_retrieve_response_code($response);

    $decoded_body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status > 299) {
      return [
        "error" => (isset($decoded_body["error"]) ? $decoded_body["error"] : "Neznámá chyba.")
      ];
    }

    return [
      "data" => $decoded_body,
    ];
  }
}
