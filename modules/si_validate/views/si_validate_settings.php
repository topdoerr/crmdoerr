<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<ul class="nav nav-tabs" role="tablist">
	<li role="presentation"  class="active">
		<a href="#si_val_settings_tab1" aria-controls="si_val_settings_tab1" role="tab" data-toggle="tab"><?php echo _l('si_val_settings_tab1'); ?></a>
	</li>
</ul>
<div class="tab-content mtop30">
	<div role="tabpanel" class="tab-pane  active" id="si_val_settings_tab1">
		<?php if(!get_option(SI_VALIDATE_MODULE_NAME.'_activated') || get_option(SI_VALIDATE_MODULE_NAME.'_activation_code')==''){?>
		<div class="row" id="si_val_validate_wrapper" data-wait-text="<?php echo '<i class=\'fa fa-spinner fa-pulse\'></i> '._l('wait_text'); ?>" data-original-text="<?php echo _l('si_val_settings_validate'); ?>">
			<div class="col-md-9">
				<i class="fa fa-question-circle pull-left" data-toggle="tooltip" data-title="<?php echo _l('si_val_settings_purchase_code_help'); ?>"></i>
				<?php echo render_input('settings['.SI_VALIDATE_MODULE_NAME.'_activation_code]','si_validate_settings_activation_code',get_option(SI_VALIDATE_MODULE_NAME.'_activation_code'),'text',array('data-toggle'=>'tooltip','data-title'=>_l('si_val_settings_purchase_code_help'),'maxlength'=>60)); 
					echo form_hidden('settings['.SI_VALIDATE_MODULE_NAME.'_activated]',get_option(SI_VALIDATE_MODULE_NAME.'_activated'));
				?>
				<span><?php echo _l('si_val_settings_valid_purchase_help'); ?></span>
				<span><a target="_blank" href="https://help.market.envato.com/hc/en-us/articles/202822600-Where-Is-My-Purchase-Code-"><?php echo _l('setup_help'); ?></a></span>
			</div>
			<div class="col-md-3 mtop25">
				<button id="si_val_validate" class="btn btn-success"><?php echo _l('si_val_settings_validate');?></button>
			</div>
			<div class="col-md-12" id="si_val_validate_messages" class="mtop25 text-left"></div>
		</div>
		<?php } else {?>
		<div class="row">
			<div class="col-md-12">
				<p><?php echo _l('si_val_settings_activated_info');?></p>
				<h4><?php echo _l('si_validate_settings_validation_heading')?></h4>
				<hr />
			</div>
		</div>
		<div class="row">	
			<div class="col-md-6">	
				<label><i class="fa fa-question-circle pull-left" data-toggle="tooltip" data-title="<?php echo _l('si_validate_settings_min_length_info',_l('si_validate_settings_check_min_length')); ?>"></i><?php echo _l('si_validate_settings_min_length');?></label>
				<?php echo render_input('settings['.SI_VALIDATE_MODULE_NAME.'_min_length]','',get_option(SI_VALIDATE_MODULE_NAME.'_min_length'),'number',array('maxlength'=>0)); ?>
			</div>
			<div class="col-md-6">
				<?php render_yes_no_option(SI_VALIDATE_MODULE_NAME.'_check_min_length','si_validate_settings_check_min_length'); ?>
			</div>
		</div>
		<hr />
		<div class="row">		
			<div class="col-md-6">
				<?php render_yes_no_option(SI_VALIDATE_MODULE_NAME.'_check_small_letter','si_validate_settings_check_small_letter'); ?>
			</div>
			<div class="col-md-6">
				<?php render_yes_no_option(SI_VALIDATE_MODULE_NAME.'_check_capital_letter','si_validate_settings_check_capital_letter'); ?>
			</div>
		</div>
		<hr />
		<div class="row">		
			<div class="col-md-6">
				<?php render_yes_no_option(SI_VALIDATE_MODULE_NAME.'_check_number','si_validate_settings_check_number'); ?>
			</div>
			<div class="col-md-6">
				<?php render_yes_no_option(SI_VALIDATE_MODULE_NAME.'_check_special_char','si_validate_settings_check_special_char'); ?>
			</div>
		</div>
		<?php } ?>
		<hr/>
	</div>
</div>