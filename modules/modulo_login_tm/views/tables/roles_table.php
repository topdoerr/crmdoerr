<?php

defined('BASEPATH') or exit('No direct script access allowed');

$aColumns = ['id', 'name'];
$sIndexColumn = 'id';
$sTable = db_prefix() . 'tm_roles';

$result = data_tables_init($aColumns, $sIndexColumn, $sTable, [], [], []);
$output  = $result['output'];
$rResult = $result['rResult'];

foreach ($rResult as $aRow) {
    $row = [];

    $row[] = $aRow['id'];
    $row[] = $aRow['name'];

    if ((int) $aRow['id'] > 3) {
        $row[] = '<a href="' . admin_url('modulo_login_tm/login_roles/delete/' . $aRow['id']) . '" class="btn btn-danger btn-sm _delete">Delete</a>';
    } else {
        $row[] = '-';
    }

    $output['aaData'][] = $row;
}

echo json_encode($output);
