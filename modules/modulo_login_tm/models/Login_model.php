<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Login_model extends App_Model
{
    protected $people_table;
    protected $roles_table;

    public function __construct()
    {
        parent::__construct();
        $this->people_table = db_prefix() . 'people';
        $this->roles_table = db_prefix() . 'tm_roles';
    }

    public function get($id)
    {
        return $this->db->where('id', (int) $id)->get($this->people_table)->row_array();
    }

    public function register($data)
    {
        if (empty($data['password'])) {
            return false;
        }

        $data['password'] = password_hash((string) $data['password'], PASSWORD_BCRYPT);
        $insertData = $this->filter_people_data($data);

        if (isset($insertData['created_at']) && empty($insertData['created_at'])) {
            $insertData['created_at'] = date('Y-m-d H:i:s');
        }

        $this->db->insert($this->people_table, $insertData);

        if ($this->db->affected_rows() > 0) {
            return (int) $this->db->insert_id();
        }

        return false;
    }

    public function find_by_email_or_phone($email, $phone = null)
    {
        $this->db->group_start()
            ->where('email', $email);

        if ($phone) {
            $this->db->or_where('phone', $phone);
        }

        $this->db->group_end();

        return $this->db->get($this->people_table)->row_array();
    }

    public function get_user_by_token_payload($payload)
    {
        if (!isset($payload['user_id'])) {
            return false;
        }

        $this->db->select('p.*, r.name as role_name');
        $this->db->from($this->people_table . ' as p');
        $this->db->join($this->roles_table . ' as r', 'r.id = p.role_id', 'left');
        $this->db->where('p.id', (int) $payload['user_id']);

        return $this->db->get()->row_array();
    }

    public function authenticate($data)
    {
        $identifier = $data['email'] ?? $data['phone'] ?? null;
        $password = $data['password'] ?? null;

        if (!$identifier || !$password) {
            return false;
        }

        $this->db->select('p.*, r.name as role_name');
        $this->db->from($this->people_table . ' as p');
        $this->db->join($this->roles_table . ' as r', 'r.id = p.role_id', 'left');
        $this->db->group_start()
            ->where('p.email', $identifier)
            ->or_where('p.phone', $identifier)
            ->group_end();

        $user = $this->db->get()->row_array();

        if ($user && isset($user['password']) && password_verify($password, $user['password'])) {
            return $user;
        }

        return false;
    }

    public function get_role_id_by_name($roleName)
    {
        $roleName = trim((string) $roleName);
        if ($roleName === '') {
            return 0;
        }

        $role = $this->db
            ->select('id')
            ->where('name', $roleName)
            ->get($this->roles_table)
            ->row_array();

        return $role ? (int) $role['id'] : 0;
    }

    public function update_password($userId, $newPassword)
    {
        $hash = password_hash((string) $newPassword, PASSWORD_BCRYPT);
        $this->db->where('id', (int) $userId);
        $this->db->update($this->people_table, ['password' => $hash]);

        return $this->db->affected_rows() > 0;
    }

    private function filter_people_data(array $data)
    {
        $availableFields = array_flip($this->db->list_fields($this->people_table));
        $filtered = [];

        foreach ($data as $key => $value) {
            if (isset($availableFields[$key])) {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }
}
