<?

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
      "headers" => [
        "X-API-KEY" => $api_key,
      ],
    ]);

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
    $response = wp_remote_get(KOREKTHOR_API_URL . "/dictionary/plugin");

    $status = wp_remote_retrieve_response_code($response);
    $decoded_body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status !== 200) {
      $error = "$status - " . (isset($decoded_body["error"]) ? $decoded_body["error"] : "Neznámá chyba.");

      return [
        "error" => "Odpoveď serveru: $error",
      ];
    }

    return [
      "data" => $decoded_body,
    ];
  }

  public static function get_error_codes() {
    $response = wp_remote_get("https://korekthor.cz/api/chyby");

    return json_decode(wp_remote_retrieve_body($response), true);
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
