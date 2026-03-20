<?php
namespace modules\modulo_login_tm\core;

defined('BASEPATH') or exit('No direct script access allowed');



use WpOrg\Requests\Requests as api_Requests;
class Logininit
{
    public static function activate($module)
    {
        require_once(__DIR__ . '/../install.php');
    }

    public static function the_da_vinci_code($module)
    {
        $CI = &get_instance();
        // Carga modules/<module>/helpers/login_helper.php
        $CI->load->helper($module . '/login');
    }
}

// Hook activation
hooks()->add_action('pre_activate_module', function($module) {
    if ($module['system_name'] == 'modulo_login_tm') {
        Logininit::activate($module);
    }
});
