<?php

defined('BASEPATH') or exit('No direct script access allowed');

$route['modulo_login_tm/api/register'] = 'loginapi/register';
$route['modulo_login_tm/api/login'] = 'loginapi/login';
$route['modulo_login_tm/api/tickets'] = 'loginapi/tickets';
$route['modulo_login_tm/api/tickets/(:num)'] = 'loginapi/ticket/$1';
$route['modulo_login_tm/api/add_ticket_reply/(:num)'] = 'loginapi/add_ticket_reply/$1';
$route['modulo_login_tm/api/categories'] = 'loginapi/categories';
$route['modulo_login_tm/api/auto_login'] = 'loginapi/auto_login';
$route['modulo_login_tm/api/ticket_replies/(:num)'] = 'loginapi/ticket_replies/$1';
$route['modulo_login_tm/api/update_profile'] = 'loginapi/update_profile';
$route['modulo_login_tm/api/change_password'] = 'loginapi/change_password';
$route['modulo_login_tm/api/agencies'] = 'loginapi/agencies';
