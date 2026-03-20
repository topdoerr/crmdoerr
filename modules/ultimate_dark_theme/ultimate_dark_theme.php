<?php
defined('BASEPATH') or exit('No direct script access allowed');
/*
Module Name: Ultimate Dark Theme
Description: Ultimate Dark Theme
Version: 2.8.3
Author: Dweb Digital Solutions
Author URI: https://dweb.digital
Requires at least: 2.3.2
*/
define('ULTIMATE_DARK_THEME', 'ultimate_dark_theme');
define('ULTIMATE_DARK_THEME_CSS', module_dir_path(ULTIMATE_DARK_THEME, 'assets/css/theme_styles.css'));
define('ULTIMATE_DARK_THEME_UPLOAD_PATH', module_dir_path(ULTIMATE_DARK_THEME, 'uploads'));

$CI = &get_instance();

function ultimate_dark_theme_activation_hook(){
	require(__DIR__ . '/install.php');
}
/**
 * Register chat language files
 */
register_language_files(ULTIMATE_DARK_THEME, ['upt']);
$CI->load->helper(ULTIMATE_DARK_THEME . '/ultimate_dark_theme');
register_activation_hook(ULTIMATE_DARK_THEME, 'ultimate_dark_theme_activation_hook');
