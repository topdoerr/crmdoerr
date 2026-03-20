<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Migration_Version_101 extends App_module_migration
{
    public function up()
    {
        $CI = &get_instance();
        $table = db_prefix() . 'categories';

        if (!$CI->db->table_exists($table)) {
            return;
        }

        if (!$CI->db->field_exists('requires_document', $table)) {
            $CI->db->query('ALTER TABLE `' . $table . '` ADD `requires_document` TINYINT(1) NOT NULL DEFAULT 0 AFTER `active`;');
        }
    }
}
