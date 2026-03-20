<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Login_roles extends AdminController
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('role_model');
    }

    public function index(): void
    {
        if ($this->input->is_ajax_request()) {
            require_once(module_dir_path(TU_MUNICIPIO_MODULE_NAME) . 'views/tables/roles_table.php');
            die;
        }

        $data['title'] = 'Roles de Usuario';
        $data['roles'] = $this->role_model->get_all();

        $this->load->view('manage_roles', $data);
    }
}
