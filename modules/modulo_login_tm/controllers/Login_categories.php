<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Login_categories extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('categories_model');
    }

    public function index()
    {
        if ($this->input->is_ajax_request()) {
            require_once(module_dir_path(TU_MUNICIPIO_MODULE_NAME) . 'views/tables/categories_table.php');
            die;
        }

        $data['title'] = 'Categories';
        $data['existing_categories'] = $this->categories_model->get_all();

        $this->load->view('manage_categories', $data);
    }


    public function add()
    {
        $name = trim((string) $this->input->post('name'));
        $imageUrl = trim((string) $this->input->post('image_url'));

        if ($name === '') {
            echo json_encode([
                'success' => false,
                'error' => 'Name is required'
            ]);
            return;
        }

        $data = [
            'name' => $name,
            'active' => ((int) $this->input->post('active') === 1) ? 1 : 0,
            'requires_document' => ((int) $this->input->post('requires_document') === 1) ? 1 : 0,
        ];

        if ($imageUrl !== '') {
            $data['image_url'] = $imageUrl;
        }

        $result = $this->categories_model->add($data);

        if ($result['success']) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => $result['error'] ?? 'Unknown error'
            ]);
        }
    }

    public function delete()
    {
        $id = $this->input->post('id');
        $result = $this->categories_model->delete($id);

        if ($result['success']) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => $result['error'] ?? 'Unknown error'
            ]);
        }
    }

    public function toggle_active()
    {
        if (!is_admin()) {
            access_denied();
        }

        $id = $this->input->post('id');
        $active = $this->input->post('active');

        $result = $this->categories_model->toggle_active($id, $active);

        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Active state updated'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to update'
            ]);
        }
    }

    public function toggle_requires_document()
    {
        if (!is_admin()) {
            access_denied();
        }

        $id = (int) $this->input->post('id');
        $requiresDocument = ((int) $this->input->post('requires_document') === 1) ? 1 : 0;

        $result = $this->categories_model->toggle_requires_document($id, $requiresDocument);

        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Document requirement updated'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to update document requirement'
            ]);
        }
    }

}
