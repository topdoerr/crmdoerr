<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Role_model extends App_Model
{

    protected $table;


    public function __construct()
    {
        parent::__construct();
        $this->table = db_prefix() . 'tm_roles';
    }

    // ------------------------------------------------------------------------
    // CRUD basico
    // ------------------------------------------------------------------------

    public function get_all()
    {
        return $this->db->get($this->table)->result_array();
    }

    public function get($id)
    {
        return $this->db->where('id', $id)->get($this->table)->row_array();
    }

    public function create($data)
    {
        $this->db->insert($this->table, $data);

        if ($this->db->affected_rows() > 0) {
            return $this->db->insert_id();
        }

        return false;
    }

    public function update($id, $data)
    {
        $this->db->where('id', $id)->update($this->table, $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id)
    {
        $this->db->where('id', $id)->delete($this->table);
        return $this->db->affected_rows() > 0;
    }

}
