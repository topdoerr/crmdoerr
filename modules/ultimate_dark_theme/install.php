<?php
defined('BASEPATH') or exit('No direct script access allowed');
$CI = &get_instance();
add_option('ultimate_dark_theme_customers', 1);

if (!is_dir(ULTIMATE_DARK_THEME_UPLOAD_PATH)) {
    mkdir(ULTIMATE_DARK_THEME_UPLOAD_PATH, 0755);
    $fp = fopen(ULTIMATE_DARK_THEME_UPLOAD_PATH . '/index.html', 'w');
    fclose($fp);
  }