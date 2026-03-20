<?php

defined('BASEPATH') or exit('No direct script access allowed');

$aColumns = [
    'p.id',
    'p.name',
    'p.email',
    'p.phone',
    'r.name as role_name',
];

$sIndexColumn = 'p.id';
$sTable = db_prefix() . 'people as p';

$join = [
    'LEFT JOIN ' . db_prefix() . 'tm_roles as r ON r.id = p.role_id'
];


$result = data_tables_init($aColumns, $sIndexColumn, $sTable, $join, [], []);
$output = $result['output'];
$rResult = $result['rResult'];

foreach ($rResult as $aRow) {
    $row = [];

    $row[] = $aRow['id'];
    $row[] = $aRow['name'];
    $row[] = $aRow['email'];
    $row[] = $aRow['phone'];

    // Cambiar esto para que tome el modelo directamente y no la db, modificar modelo
    $roles = get_instance()->db->get(db_prefix() . 'tm_roles')->result();
    $select = '<select class="form-control role-select" data-user-id="' . $aRow['id'] . '">';
    foreach ($roles as $role) {
        $selected = ($role->name == $aRow['role_name']) ? 'selected' : '';
        $select .= '<option value="' . $role->id . '" ' . $selected . '>' . $role->name . '</option>';
    }
    $select .= '</select>';

    $row[] = $select;

    $actions = '<button class="btn btn-danger btn-sm btn-delete-citizen" data-id="'.$aRow['id'].'"><i class="fa fa-trash"></i></button>';
    $row[] = $actions;

    $output['aaData'][] = $row;
}


echo json_encode($output);
