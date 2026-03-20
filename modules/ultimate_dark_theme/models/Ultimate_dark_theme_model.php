<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ultimate_dark_theme_model extends App_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Recupera as configurações do tema.
     *
     * @return array
     */
    public function get_settings()
    {
        $this->db->from(db_prefix() . 'options');
        $this->db->where('name', 'like', 'ultimate_dark_theme_%');
        $result = $this->db->get();

        return $result->result_array();
    }

    /**
     * Adiciona uma nova configuração ao banco de dados.
     *
     * @param string $name
     * @param string $value
     * @return boolean
     */
    public function add_setting($name, $value)
    {
        $data = [
            'name' => $name,
            'value' => $value,
        ];

        return $this->db->insert(db_prefix() . 'options', $data);
    }

    /**
     * Atualiza uma configuração existente.
     *
     * @param string $name
     * @param string $value
     * @return boolean
     */
    public function update_setting($name, $value)
    {
        $this->db->set('value', $value);
        $this->db->where('name', $name);

        return $this->db->update(db_prefix() . 'options');
    }

    /**
     * Deleta uma configuração.
     *
     * @param string $name
     * @return boolean
     */
    public function delete_setting($name)
    {
        $this->db->where('name', $name);

        return $this->db->delete(db_prefix() . 'options');
    }
}
