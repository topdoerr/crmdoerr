<?php
defined('BASEPATH') or exit('No direct script access allowed');
/*
Module Name: Add-on Validation
Description: Module provides extra Validation for Passwords used by admin and clients.
Author: Sejal Infotech
Version: 1.0.5
Requires at least: 2.3.*
Author URI: http://www.sejalinfotech.com
*/

define('SI_VALIDATE_MODULE_NAME', 'si_validate');
define('SI_VALIDATE_VALIDATION_URL','http://www.sejalinfotech.com/perfex_validation/index.php');
define('SI_VALIDATE_KEY','c2lfdmFsaWRhdGU=');

$CI = &get_instance();

hooks()->add_filter('module_'.SI_VALIDATE_MODULE_NAME.'_action_links', 'module_si_validate_action_links');
hooks()->add_action('admin_init', 'si_validate_hook_admin_init');
hooks()->add_action('settings_tab_footer','si_validate_hook_settings_tab_footer');#for perfex low version V2.4 
hooks()->add_action('settings_group_end','si_validate_hook_settings_tab_footer');#for perfex high version V2.8.4
if(get_option(SI_VALIDATE_MODULE_NAME.'_activated') && get_option(SI_VALIDATE_MODULE_NAME.'_activation_code')!=''){
hooks()->add_action('app_admin_footer','si_validate_hook_change_password_validation_admin');
hooks()->add_action('app_customers_footer', 'si_validate_hook_change_password_validation_client');
hooks()->add_action('app_admin_authentication_head', 'si_validate_hook_change_password_validation_admin_reset_pswd');
}

function module_si_validate_action_links($actions)
{
	if(get_option(SI_VALIDATE_MODULE_NAME.'_activated') && get_option(SI_VALIDATE_MODULE_NAME.'_activation_code')!=''){
		$actions[] = '<a href="' . admin_url('settings?group=si_validate_settings') . '">' . _l('settings') . '</a>';
	}
	else
		$actions[] = '<a href="' . admin_url('settings?group=si_validate_settings') . '">' . _l('si_val_settings_validate') . '</a>';
	return $actions;
}

function si_validate_hook_settings_tab_footer($tab)
{
	$slug = isset($tab['id']) ? $tab['id'] : $tab['slug'];//slug is deprecated from Perfex Version 3.2
	if($slug=='si_validate_settings' && !get_option(SI_VALIDATE_MODULE_NAME.'_activated')){
		echo '<script src="'.module_dir_url('si_validate','assets/js/si_validate_settings_footer.js').'"></script>';
	}
}

register_activation_hook(SI_VALIDATE_MODULE_NAME, 'si_validate_activation_hook');

function si_validate_activation_hook()
{
	$CI = &get_instance();
	require_once(__DIR__ . '/install.php');
}

/**
 * Register Uninstall module hook
 */
register_uninstall_hook(SI_VALIDATE_MODULE_NAME, 'si_validate_uninstall_hook');

function si_validate_uninstall_hook()
{
    $CI = &get_instance();
	require_once(__DIR__ . '/uninstall.php');
}

/**
* Register language files, must be registered if the module is using languages
*/
register_language_files(SI_VALIDATE_MODULE_NAME, [SI_VALIDATE_MODULE_NAME]);

/**
*	Admin Init Hook for module
*/
function si_validate_hook_admin_init()
{
	$CI = &get_instance();
	if (is_admin() || has_permission('settings', '', 'view')) {
		$perfex_version = (int)$CI->app->get_current_db_version();
	    $slug = 'si_validate_settings';
	    $tab = [
			'name'     => _l('si_validate_settings'),
			'view'     => 'si_validate/si_validate_settings',
			'icon'	   => 'fa-regular fa-circle-check',//for Perfex V3.0	
			'position' => 60,
		];
		if($perfex_version >= 320)
	        $CI->app->add_settings_section_child('other', $slug, $tab);
	    else
		    $CI->app_tabs->add_settings_tab($slug, $tab);
	}
}

function si_validate_hook_change_password_validation_admin()
{
	if(get_option(SI_VALIDATE_MODULE_NAME.'_activated') && get_option(SI_VALIDATE_MODULE_NAME.'_activation_code')!=''){
		$CI = &get_instance();
		echo '<script src="'.module_dir_url('si_validate', 'assets/js/PassRequirements.js').'?v='.$CI->app_scripts->core_version().'"></script>';
		
		$enabled = set_dynamic_validate_rules();
		
		if($enabled)	
			echo '<script src="'.module_dir_url('si_validate', 'assets/js/si_validate_admin.js').'?v='.$CI->app_scripts->core_version().'"></script>';
		
	}	
}

function si_validate_hook_change_password_validation_admin_reset_pswd()
{
	$CI = &get_instance();
	echo '<link src="'.site_url('assets/plugins/bootstrap/css/bootstrap.min.css').'" rel="stylesheet">';
	echo '<script src="'.site_url('assets/plugins/jquery/jquery.min.js').'?v='.$CI->app_scripts->core_version().'"></script>';
	echo '<script src="'.site_url('assets/plugins/bootstrap/js/bootstrap.min.js').'?v='.$CI->app_scripts->core_version().'"></script>';
	echo '<script src="'.site_url('assets/plugins/jquery-validation/jquery.validate.min.js').'?v='.$CI->app_scripts->core_version().'"></script>';
	echo '<script src="'.site_url('assets/plugins/internal/validation/app-form-validation.min.js').'?v='.$CI->app_scripts->core_version().'"></script>';
	si_validate_hook_change_password_validation_admin();
}

function si_validate_hook_change_password_validation_client()
{
	if(get_option(SI_VALIDATE_MODULE_NAME.'_activated') && get_option(SI_VALIDATE_MODULE_NAME.'_activation_code')!=''){
		$CI = &get_instance();
		echo '<script src="'.module_dir_url('si_validate', 'assets/js/PassRequirements.js').'?v='.$CI->app_scripts->core_version().'"></script>';
		
		$enabled = set_dynamic_validate_rules();
		
		if($enabled)
			echo '<script src="'.module_dir_url('si_validate', 'assets/js/si_validate_client.js').'?v='.$CI->app_scripts->core_version().'"></script>';
	}
}
function set_dynamic_validate_rules()
{
	$min_length 			= get_option(SI_VALIDATE_MODULE_NAME.'_min_length');
	$check_min_length 		= get_option(SI_VALIDATE_MODULE_NAME.'_check_min_length');
	$check_small_letter 	= get_option(SI_VALIDATE_MODULE_NAME.'_check_small_letter');
	$check_capital_letter 	= get_option(SI_VALIDATE_MODULE_NAME.'_check_capital_letter');
	$check_number 			= get_option(SI_VALIDATE_MODULE_NAME.'_check_number');
	$check_special_char 	= get_option(SI_VALIDATE_MODULE_NAME.'_check_special_char');
	if($check_min_length || $check_small_letter || $check_capital_letter || $check_number || $check_special_char) {
	?>
	<script>
	//var regularExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[_?\W])(?=.{8,})/; // validate when submit
	var regularExpression = /^<?php if($check_small_letter) echo "(?=.*[a-z])"?><?php if($check_capital_letter) echo "(?=.*[A-Z])"?><?php if($check_number) echo "(?=.*[0-9])"?><?php if($check_special_char) echo "(?=.*[_?\W])"?><?php if($check_min_length) echo "(?=.{".$min_length.",})"?>/; // validate when submit
	var validateReq = {
        rules: {
            <?php if($check_min_length){?>
				minlength: {
					text: "<?php echo _l('si_validate_text_min_length')?>",
					minLength: <?php echo $min_length;?>,
				},
			<?php } if($check_special_char){?>
				containSpecialChars: {
					text: "<?php echo _l('si_validate_text_special_char')?>",
					minLength: 1,
					//regex: new RegExp('([^!,%,&,@,#,$,^,*,?,_,-,~,.,(,),+,=,{,},[,],:,;,",\',<,>])', 'g')
					regex: new RegExp('([^!,%,&,@,#,$,^,*,?,_,\\-,~,.,(,),+,=,{,},\\[,\\],|,\\\\,:,;,",\',<,>,/])', 'g')
				},
			<?php } if($check_small_letter){?>	
				containLowercase: {
					text: "<?php echo _l('si_validate_text_small_letter')?>",
					minLength: 1,
					regex: new RegExp('[^a-z]', 'g')
				},
			<?php } if($check_capital_letter){?>		
				containUppercase: {
					text: "<?php echo _l('si_validate_text_capital_letter')?>",
					minLength: 1,
					regex: new RegExp('[^A-Z]', 'g')
				},
			<?php } if($check_number){?>		
				containNumbers: {
					text: "<?php echo _l('si_validate_text_number')?>",
					minLength: 1,
					regex: new RegExp('[^0-9]', 'g')
				}
			<?php }?>	
        },
       // popoverPlacement: 'top',
        defaults: false,
       // trigger: 'focus'
    };
	</script>
	<?php
		return true;
	}
	return false;
}