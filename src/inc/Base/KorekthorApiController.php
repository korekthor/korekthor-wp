<?

/**
 * @package korekthor
 */

namespace Inc\Base;

class KorekthorApiController {
  public static function get_company_data() {
    $api_key = get_option("korekthor_api_key");

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

      var_dump($decoded_body);

      return [
        "error" => "Nepodařilo se načíst data o firmě. API klíč může být neplatný. Server odpověděl: <code>$error</code>",
      ];
    }

    return [
      "data" => $decoded_body,
    ];
  }
}
