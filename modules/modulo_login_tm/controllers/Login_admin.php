<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Login_admin extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('login_model');
    }

    public function index()
    {
        if ($this->input->is_ajax_request()) {
            require_once(module_dir_path(TU_MUNICIPIO_MODULE_NAME) . 'views/tables/citizens_table.php');
            die;
        }

        $data['title'] = 'Ciudadanos Registrados';
        $this->load->view('manage', $data);

    }

    public function edit($id)
    {
        $citizen = $this->login_model->get($id);

        if (!$citizen) {
            set_alert('warning', 'Ciudadano no encontrado');
            redirect(admin_url(TU_MUNICIPIO_MODULE_NAME . '/login_admin'));
        }

        if ($this->input->post()) {
            $data = $this->input->post();
            unset($data['password']);

            if (!empty($this->input->post('password'))) {
                $data['password'] = password_hash($this->input->post('password'), PASSWORD_BCRYPT);
            }

            $this->db->where('id', $id);
            $this->db->update(db_prefix() . 'people', $data);

            set_alert('success', 'Ciudadano actualizado');
            redirect(admin_url(TU_MUNICIPIO_MODULE_NAME . '/login_admin'));
        }

        $data['citizen'] = $citizen;
        $this->load->view('edit', $data);
    }

    public function change_role()
    {
        if (!is_admin()) {
            access_denied('Change Role');
        }

        $user_id = $this->input->post('user_id');
        $role_id = $this->input->post('role_id');

        if ($user_id && $role_id) {
            $this->db->where('id', $user_id);
            $updated = $this->db->update(db_prefix() . 'people', ['role_id' => $role_id]);

            if ($updated) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
        } else {
            echo json_encode(['success' => false]);
        }
    }

    public function delete()
    {
        if (!is_admin()) {
            access_denied('Delete Citizen');
        }

        $id = (int)$this->input->post('id');
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'Missing id']);
            return;
        }

        $this->db->where('id', $id);
        $deleted = $this->db->delete(db_prefix() . 'people');

        echo json_encode(['success' => (bool)$deleted]);
    }

}
