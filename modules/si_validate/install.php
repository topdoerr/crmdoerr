<?php
defined('BASEPATH') or exit('No direct script access allowed');

add_option(SI_VALIDATE_MODULE_NAME.'_activated',0);
add_option(SI_VALIDATE_MODULE_NAME.'_activation_code','');
add_option(SI_VALIDATE_MODULE_NAME.'_min_length',8);
add_option(SI_VALIDATE_MODULE_NAME.'_check_min_length',1);
add_option(SI_VALIDATE_MODULE_NAME.'_check_small_letter',1);
add_option(SI_VALIDATE_MODULE_NAME.'_check_capital_letter',1);
add_option(SI_VALIDATE_MODULE_NAME.'_check_number',1);
add_option(SI_VALIDATE_MODULE_NAME.'_check_special_char',1);