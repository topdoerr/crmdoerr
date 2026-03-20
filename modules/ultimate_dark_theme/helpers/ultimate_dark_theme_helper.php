<?php
/*
Module Name: Ultimate Dark Theme
Description: Ultimate Dark Theme
Version: 2.8.3
Author: Flykod
Author URI: https://flykod.com
Requires at least: 2.2.2
*/
defined('BASEPATH') or exit('No direct script access allowed');
hooks()->add_action('app_admin_head', 'admin_theme_head_component');
hooks()->add_action('admin_init', 'ultimate_dark_theme_settings_tab');
hooks()->add_action('app_admin_footer', 'ultimate_theme_admin_theme_footer');

function ultimate_theme_admin_theme_footer(){
    echo '<script src="' . base_url('modules/ultimate_dark_theme/assets/js/ultimate-theme.js') . '"></script>';
}
// Check if customers theme is enabled
if (get_option('ultimate_dark_theme_customers') == '1') {
    hooks()->add_action('app_customers_head', 'app_dark_head');
}
/**
 * Theme customers login includes
 * @return stylesheet / script
 */
hooks()->add_action('app_admin_authentication_head', 'custom_admin_login_scripts_and_styles');
function custom_admin_login_scripts_and_styles() {
    
    $ci =& get_instance();
    $csrf_name = $ci->security->get_csrf_token_name();
    $csrf_hash = $ci->security->get_csrf_hash();

    // Traduções
    $login_heading = _l('admin_auth_login_heading');
    $email_label = _l('admin_auth_login_email');
    $password_label = _l('admin_auth_login_password');
    $login_button = _l('admin_auth_login_button');
    $forgot_password = _l('admin_auth_login_fp');

    $primary_U_color = get_option('u_t_primary_color');
    $secondary_U_color = get_option('u_t_secondary_color');
    if (empty($primary_U_color) && empty($secondary_U_color)) {
        echo "<style>:root {--primary-color: #1b99c8;--secondary-color: #2e9cdb;}</style>";
    } else {
        echo "<style>:root {--primary-color: " . get_option('u_t_primary_color') . "; --secondary-color: " . get_option('u_t_secondary_color') . ";}</style>";
    }

    $logo_url = base_url('uploads/company/' . get_option('company_logo_dark'));
    $background_image_url = get_option('login_background_image');
    $background_image_full_url = !empty($background_image_url) ? base_url('modules/ultimate_dark_theme/uploads/login_background/' . $background_image_url) : '';

    echo "<script>
            var csrfName = '" . $csrf_name . "';
            var csrfHash = '" . $csrf_hash . "';
            
            var translations = {
                login_heading: '{$login_heading}',
                email_label: '{$email_label}',
                password_label: '{$password_label}',
                login_button: '{$login_button}',
                forgot_password: '{$forgot_password}'
            };

            var siteUrl = '" . site_url() . "';
            var logoUrl = '" . $logo_url . "';
            var backgroundImageUrl = '" . $background_image_full_url . "';
          </script>";

    echo '<link rel="stylesheet" href="' . base_url('modules/ultimate_dark_theme/assets/css/custom_login_style.css') . '">';
    echo '<script src="' . base_url('modules/ultimate_dark_theme/assets/js/custom_login_layout.js') . '"></script>';
}
/**
 * Theme clients footer includes
 * @return stylesheet
 */
function app_dark_head(){
    $primary_U_color = get_option('u_t_primary_color');
    $secondary_U_color = get_option('u_t_secondary_color');
    if (empty($primary_U_color) && empty($secondary_U_color)) {
        echo "<style>:root {--primary-color: #1b99c8;--secondary-color: #2e9cdb;}</style>";
    } else {
        echo "<style>:root {--primary-color: " . get_option('u_t_primary_color') . "; --secondary-color: " . get_option('u_t_secondary_color') . ";}</style>";
    }
    
    echo '<link href="' . base_url('modules/ultimate_dark_theme/assets/css/clients/clients.css') . '"  rel="stylesheet" type="text/css" >';
    
}
/**
 * [ultimate_dark_theme_settings_tab net menu item in setup->settings]
 * @return void
 */
function ultimate_dark_theme_settings_tab(){
    $CI = &get_instance();
    $CI->app_tabs->add_settings_tab('admin-theme-settings', [
        'name'     => '' . _l('Ultimate Theme Config') . '',
        'view'     => 'ultimate_dark_theme/admin_theme_settings',
        'position' => 46,
    ]);
}
/**
 * Injects theme CSS
 * @return null
 */
function admin_theme_head_component(){
    $primary_U_color = get_option('u_t_primary_color');
    $secondary_U_color = get_option('u_t_secondary_color');
    if (empty($primary_U_color) && empty($secondary_U_color)) {
        echo "<style>:root {--primary-color: #1b99c8;--secondary-color: #2e9cdb;}</style>";
    } else {
        echo "<style>:root {--primary-color: " . get_option('u_t_primary_color') . "; --secondary-color: " . get_option('u_t_secondary_color') . ";}</style>";
    }
    echo '<link href="' . base_url('modules/ultimate_dark_theme/assets/css/theme_styles.css') . '"  rel="stylesheet" type="text/css" >';
    
}
/**
 * Changes task filters color and background
 * @return array
 */
hooks()->add_action('app_init', 'initialize_ultimate_dark_theme_task_filters');
/**
 * Changes system favorite colors
 * @return array
 */
hooks()->add_filter('system_favourite_colors', 'admin_dark_system_colors_theme_hook');
function admin_dark_system_colors_theme_hook($colors){
    foreach ($colors as $key => $color) {
        if ($color == '#ff2d42') {
            $colors[$key] = '#ff0019';
        }
        if ($color == '#28B8DA') {
            $colors[$key] = '#E9751E';
        }
        if ($color == '#03a9f4') {
            $colors[$key] = '#2a44c5';
        }
        if ($color == '#757575') {
            $colors[$key] = '#595959';
        }
        if ($color == '#8e24aa') {
            $colors[$key] = '#cc0099';
        }
        if ($color == '#d81b60') {
            $colors[$key] = '#F86A00';
        }
        if ($color == '#0288d1') {
            $colors[$key] = '#3333ff';
        }
        if ($color == '#7cb342') {
            $colors[$key] = '#2eb82e';
        }
        if ($color == '#fb8c00') {
            $colors[$key] = '#e67e00';
        }
        if ($color == '#84C529') {
            $colors[$key] = '#71a923';
        }
        if ($color == '#fb3b3b') {
            $colors[$key] = '#fa1e1e';
        }
    }
    return $colors;
}
function initialize_ultimate_dark_theme_task_filters(){
    hooks()->add_filter('before_get_task_statuses', 'admin_dark_dashboard_label_task_colors');
}
function admin_dark_dashboard_label_task_colors($statuses){
    $CI = &get_instance();
    if (!class_exists('tasks_model', false)) {
        $CI->load->model('tasks_model');
    }
    foreach ($statuses as $key => $status) {
        $id = $status['id'];
        switch ($id) {
            case $id == Tasks_model::STATUS_NOT_STARTED:
                $statuses[$key]['color'] = '#ffb822';
                break;
            case $id == Tasks_model::STATUS_AWAITING_FEEDBACK:
                $statuses[$key]['color'] = '#0abb87';
                break;
            case $id == Tasks_model::STATUS_IN_PROGRESS:
                $statuses[$key]['color'] = '#764abc';
                break;
            case $id == Tasks_model::STATUS_COMPLETE:
                $statuses[$key]['color'] = '#84c529';
                break;
        }
    }
    return $statuses;
}
/**
 * Changes project filters color
 * @return array
 */
hooks()->add_action('app_init', 'initialize_ultimate_dark_theme_project_filters');
function initialize_ultimate_dark_theme_project_filters(){
    hooks()->add_filter('before_get_project_statuses', 'admin_dark_dashboard_label_project_colors');
}
function admin_dark_dashboard_label_project_colors($statuses){
    foreach ($statuses as $key => $status) {
        $id = $status['id'];
        switch ($id) {
            case $id == 3:
                $statuses[$key]['color'] = '#ffb822';
                break;
            case $id == 4:
                $statuses[$key]['color'] = '#0abb87';
                break;
            case $id == 1:
                $statuses[$key]['color'] = '#777777';
                break;
            case $id == 2:
                $statuses[$key]['color'] = '#764abc';
                break;
            case $id == 5:
                $statuses[$key]['color'] = 'rgb(250, 30, 30)';
                break;
        }
    }
    return $statuses;
}

// Whatsapp Estimate Send
hooks()->add_action('after_estimate_view_as_client_link', 'add_whatsapp_button_to_estimate');
function add_whatsapp_button_to_estimate($estimate) {
    try {
        if (!is_object($estimate) || !isset($estimate->id)) {
            throw new Exception('Invalid estimate object.');
        }
        $greeting_text = get_option('whatsapp_greeting_text', 'Greetings');
        $message_body = get_option('whatsapp_message_body', 'Please use the following link to access your detailed estimate:');
        $button_text = get_option('whatsapp_button_text', 'Send in Whatsapp');
        $team_name = get_option('whatsapp_team_name', 'Your Team Name');
       
        $CI = &get_instance();
        $client_id = $estimate->clientid;
        $CI->db->select('firstname, lastname, phonenumber');
        $CI->db->from('tblcontacts');
        $CI->db->where('userid', $client_id);
        $CI->db->where('is_primary', 1);
        $client_info = $CI->db->get()->row();

        if ($client_info->phonenumber) {
            $client_name = $client_info->firstname . ' ' . $client_info->lastname;
            $tel_zap = $client_info->phonenumber;
        } else {
            $client_info = get_client($estimate->clientid);
            $client_name = $client_info ? $client_info->company : '';
            $tel_zap = $client_info ? $client_info->phonenumber : '';
        }

        $estimate_number = format_estimate_number($estimate->id);
        $link_estimate = site_url('viewestimate/' . $estimate->id . '/' . $estimate->hash);
        $msg_whatsapp = "{$estimate_number}\n\n*{$greeting_text} {$client_name}!*\n\n{$message_body}\n{$link_estimate}\n\n*{$team_name}*";
        $msg_whatsapp_encoded = urlencode($msg_whatsapp);
        // $url_zap = "https://wa.me/send?phone=$tel_zap&text=$msg_whatsapp_encoded";
        // $url_zap = "https://api.whatsapp.com/send/?phone=$tel_zap&text=$msg_whatsapp_encoded";
        $url_zap = "whatsapp://send/?phone=$tel_zap&text=$msg_whatsapp_encoded";
        echo "<a style='margin-right: 4px;' target='_blank' href='" . htmlspecialchars($url_zap) . "' class='btn btn-default whatsappSendButton'><i class='fa-brands fa-whatsapp'></i> {$button_text}</a>";
    } catch (Exception $e) {
        echo "<script>console.error('Error: " . addslashes($e->getMessage()) . "');</script>";
    }
}


// Whatsapp Proposal Send
hooks()->add_action('after_proposal_view_as_client_link', 'add_whatsapp_button_to_proposal');
function add_whatsapp_button_to_proposal($proposal) {
    if (empty($proposal) || !isset($proposal->id)) {
        return;
    }
    $greeting_text = get_option('whatsapp_greeting_text', 'Greetings');
    $message_body = get_option('whatsapp_message_body', 'Please use the following link to access your detailed quote:');
    $button_text = get_option('whatsapp_button_text', 'Send in Whatsapp');
    $team_name = get_option('whatsapp_team_name', 'Your Team Name Here');
    $client_name_html = format_proposal_info($proposal, 'admin');
    $client_name = strip_tags($client_name_html);
    $name_parts = explode(' ', trim($client_name));
    $first_name_client = $name_parts[0] ?? '';
    $proposal_number_html = format_proposal_number($proposal->id);
    $proposal_number = strip_tags($proposal_number_html);
    $tel_zap = $proposal->phone;
    $link_proposal = site_url('viewproposal/' . $proposal->id . '/' . $proposal->hash);
    $msg_whatsapp = "{$proposal_number}\n\n*{$greeting_text} {$first_name_client}!*\n\n{$message_body}\n{$link_proposal}\n\n*{$team_name}*";
    $msg_whatsapp_encoded = urlencode($msg_whatsapp);
    // $url_zap = "https://wa.me/send?phone=$tel_zap&text=$msg_whatsapp_encoded";
    // $url_zap = "https://api.whatsapp.com/send/?phone=$tel_zap&text=$msg_whatsapp_encoded";
    $url_zap = "whatsapp://send/?phone=$tel_zap&text=$msg_whatsapp_encoded";

    echo "<a style='margin-right: 4px;' target='_blank' href='" . htmlspecialchars($url_zap) . "' class='btn btn-default whatsappSendButton'><i class='fa-brands fa-whatsapp'></i> {$button_text}</a>";

}
