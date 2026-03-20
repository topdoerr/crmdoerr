<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Categories_model extends App_Model
{
    protected $table;

    public function __construct()
    {
        parent::__construct();
        $this->table = db_prefix() . 'categories';
    }

    // ------------------------------------------------------------------------
    // CRUD básico
    // ------------------------------------------------------------------------

    public function get_all()
    {
        return $this->db->get($this->table)->result_array();
    }

    public function get_active()
    {
        return $this->db
            ->where('active', 1)
            ->order_by('name', 'ASC')
            ->get($this->table)
            ->result_array();
    }

    public function get_by_id($id)
    {
        return $this->db
            ->where('id', (int) $id)
            ->get($this->table)
            ->row_array();
    }


    public function add($data)
    {
        $this->db->insert($this->table, $data);

        if ($this->db->affected_rows() > 0) {
            return ['success' => true];
        } else {
            return [
                'success' => false,
                'error' => $this->db->error()
            ];
        }
    }

    public function toggle_active($id, $active)
    {
        $this->db->where('id', $id);
        $this->db->update($this->table, ['active' => $active]);

        if ($this->db->affected_rows() > 0) {
            return ['success' => true];
        } else {
            return [
                'success' => false,
                'error' => $this->db->error()
            ];
        }
    }

    public function delete($id)
    {
        $this->db->where('id', $id);
        $this->db->delete($this->table);

        if ($this->db->affected_rows() > 0) {
            return ['success' => true];
        } else {
            return [
                'success' => false,
                'error' => $this->db->error()
            ];
        }
    }

    public function toggle_requires_document($id, $requiresDocument)
    {
        $this->db->where('id', (int) $id);
        $this->db->update($this->table, ['requires_document' => (int) $requiresDocument]);

        if ($this->db->affected_rows() > 0) {
            return ['success' => true];
        }

        $dbError = $this->db->error();
        if (!empty($dbError['code'])) {
            return [
                'success' => false,
                'error' => $dbError
            ];
        }

        return ['success' => true];
    }
}
