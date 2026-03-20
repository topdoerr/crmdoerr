<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ultimate_dark_theme_admin extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('ultimate_dark_theme_model');
    }

    public function index()
    {
        $data['settings'] = $this->ultimate_dark_theme_model->get_settings();
        $data['title'] = _l('ultimate_dark_theme_settings_title');
        $this->load->view('ultimate_dark_theme_settings', $data);
    }

    public function upload_background_image() {
        $config['upload_path'] = FCPATH . 'modules/ultimate_dark_theme/uploads/login_background/';
        $config['allowed_types'] = 'gif|jpg|png|jpeg';
        $config['max_size'] = 2048;
        $config['encrypt_name'] = TRUE;
        $this->load->library('upload', $config);
        if (!$this->upload->do_upload('login_background_image')) {
            $errors = $this->upload->display_errors('', '');
            echo json_encode(['success' => false, 'message' => $errors]);
        } else {
            $file_data = $this->upload->data();
            update_option('login_background_image', $file_data['file_name']);
            echo json_encode(['success' => true, 'message' => 'Imagem carregada com sucesso!', 'file_path' => $file_data['file_name']]);
        }
    }

    public function save_settings()
    {
        if ($this->input->post()) {
            echo 'Form has been submitted.<br>';
            if (isset($_FILES['login_background_image']['name']) && $_FILES['login_background_image']['name'] != '') {
                echo 'File upload detected.<br>';
                echo 'File name: ' . $_FILES['login_background_image']['name'] . '<br>';
                $this->handle_image_upload(); 
            } else {
                echo 'No file uploaded.<br>'; 
            }
            set_alert('success', _l('settings_updated_successfully'));
            redirect(admin_url('ultimate_dark_theme_admin'));
            die();
        } else {
            echo 'No POST data received.<br>';
            die();
        }
    }


    private function handle_image_upload() {
        $upload_path = FCPATH . 'uploads/login_background/';
        if (!is_dir($upload_path)) {
            if (!mkdir($upload_path, 0755, true)) {
                die('Failed to create directory.');
            } else {
                echo 'Directory created successfully.<br>';
            }
        } else {
            echo 'Directory already exists.<br>';
        }
    
        $config['upload_path'] = $upload_path;
        $config['allowed_types'] = 'gif|jpg|png|jpeg';
        $config['max_size'] = 2048;
        $config['encrypt_name'] = TRUE;
    
        $this->load->library('upload', $config);
    
        echo 'Trying to upload...<br>';
        if (!$this->upload->do_upload('login_background_image')) {
            var_dump($this->upload->display_errors());
            die();
        } else {
            $data = $this->upload->data();
            update_option('login_background_image', $data['file_name']);
            echo 'Upload successful, file saved as: ' . $data['file_name'] . '<br>';
            die();
        }
    }
    
}
