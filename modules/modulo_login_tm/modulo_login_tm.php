<?php

defined('BASEPATH') or exit('No direct script access allowed');

require_once __DIR__ . '/core/Logininit.php';

/*
Module Name: Tu Municipio Integration
Description: Mobile app extension module
Version: 1.0.1
Author: EllipsisPR LLC.
Author URI: https://www.ellipsispr.com/
*/

define('TU_MUNICIPIO_MODULE_NAME', 'modulo_login_tm');

// Cargar clase de inicializacion
modules\modulo_login_tm\core\Logininit::the_da_vinci_code(TU_MUNICIPIO_MODULE_NAME);
require_once __DIR__ . '/hooks/hooks.php';

// Registrar archivos de idioma si se agregan
register_language_files(TU_MUNICIPIO_MODULE_NAME, [TU_MUNICIPIO_MODULE_NAME]);

// Hook de activacion del modulo
register_activation_hook(TU_MUNICIPIO_MODULE_NAME, 'tu_municipio_module_activation');
function tu_municipio_module_activation()
{
    require_once __DIR__ . '/install.php';
}

hooks()->add_action('admin_init', 'tu_municipio_module_init_menu');
hooks()->add_action('app_init', 'tu_municipio_module_maybe_upgrade_schema');

function tu_municipio_module_maybe_upgrade_schema(): void
{
    $targetVersion = '1.0.1';
    $installedVersion = get_option('tu_municipio_module_schema_version');

    if ($installedVersion === $targetVersion) {
        return;
    }

    require_once __DIR__ . '/install.php';

    if ($installedVersion === false) {
        add_option('tu_municipio_module_schema_version', $targetVersion);
    } else {
        update_option('tu_municipio_module_schema_version', $targetVersion);
    }
}

function tu_municipio_module_init_menu()
{
    $CI = &get_instance();

    if (is_admin()) {
        $CI->app_menu->add_sidebar_menu_item('login-module-group', [
            'slug' => 'login-module-group',
            'name' => 'Tu Municipio',
            'icon' => 'fa fa-id-card',
            'position' => 30,
        ]);

        $CI->app_menu->add_sidebar_children_item('login-module-group', [
            'slug' => 'login-citizens',
            'name' => _l('Citizens'),
            'href' => admin_url(TU_MUNICIPIO_MODULE_NAME . '/login_admin'),
        ]);

        $CI->app_menu->add_sidebar_children_item('login-module-group', [
            'slug' => 'login-roles',
            'name' => _l('Roles'),
            'href' => admin_url(TU_MUNICIPIO_MODULE_NAME . '/login_roles'),
        ]);

        $CI->app_menu->add_sidebar_children_item('login-module-group', [
            'slug' => 'login-categories',
            'name' => _l('Categories'),
            'href' => admin_url(TU_MUNICIPIO_MODULE_NAME . '/login_categories'),
        ]);
    }
}
