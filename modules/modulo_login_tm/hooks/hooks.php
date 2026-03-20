<?php

defined('BASEPATH') or exit('No direct script access allowed');

hooks()->add_action('app_admin_footer', 'tu_municipio_inject_worker_dropdown');

function tu_municipio_inject_worker_dropdown()
{
    $CI = &get_instance();

    if (!preg_match('#^admin/tickets/ticket/\d+$#', $CI->uri->uri_string())) {
        return;
    }

    if (!$CI->db->table_exists(db_prefix() . 'people') || !$CI->db->table_exists(db_prefix() . 'tm_roles')) {
        return;
    }

    $workers = $CI->db
        ->select('p.id, p.name')
        ->from(db_prefix() . 'people as p')
        ->join(db_prefix() . 'tm_roles as r', 'r.id = p.role_id', 'left')
        ->where('r.name', 'Worker')
        ->get()
        ->result_array();

    if (empty($workers)) {
        return;
    }

    $workerOptions = [];
    foreach ($workers as $worker) {
        $workerOptions[] = [
            'id' => 'people_' . $worker['id'],
            'text' => '[Worker] ' . $worker['name'],
        ];
    }

    $jsonOptions = json_encode($workerOptions);

    echo '<script>
    $(function () {
        var retries = 0;
        var maxRetries = 10;

        var interval = setInterval(function () {
            var assignedSelect = $("select[name=\'assigned\']");

            if (assignedSelect.length && assignedSelect.hasClass("selectpicker")) {
                var workerOptions = ' . $jsonOptions . ';

                workerOptions.forEach(function (option) {
                    if (assignedSelect.find("option[value=\'" + option.id + "\']").length === 0) {
                        assignedSelect.append(new Option(option.text, option.id));
                    }
                });

                assignedSelect.selectpicker("refresh");
                clearInterval(interval);
            }

            retries++;
            if (retries >= maxRetries) {
                clearInterval(interval);
            }
        }, 500);
    });
    </script>';
}
