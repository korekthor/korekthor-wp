<?php

/**
 * This file is going to triggered on plugin uninstallation
 * 
 * @package korekthor
 */

if (!defined("WP_UNINSTALL_PLUGIN")) die("(╯°□°）╯︵ ┻━┻ ");

// Clear database stored data
// TODO

global $wpdb;
$wpdb->query("DELETE FROM wp_options WHERE option_name LIKE 'korekthor_%'");
