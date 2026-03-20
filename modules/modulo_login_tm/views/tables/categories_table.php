<?php

defined('BASEPATH') or exit('No direct script access allowed');

$aColumns = ['id', 'name', 'active', 'requires_document'];
$sIndexColumn = 'id';
$sTable = db_prefix() . 'categories';

$result = data_tables_init($aColumns, $sIndexColumn, $sTable, [], [], []);
$output = $result['output'];
$rResult = $result['rResult'];

foreach ($rResult as $aRow) {
    $row = [];

    $row[] = $aRow['id'];

    $deleteButton = '<div class="delete-category hidden-on-hover" data-id="'.$aRow['id'].'" data-toggle="tooltip" title="Delete Category">'
        . '<span class="delete-button">Delete</span>'
        . '</div>';

    $nameWithButton = '<div class="category-name-wrapper">'
        . '<div>' . $aRow['name'] . '</div>'
        . $deleteButton
        . '</div>';


    $row[] = $nameWithButton;

    $buttonClass = $aRow['active'] ? 'btn-success' : 'btn-danger';
    $buttonText = $aRow['active'] ? 'Active' : 'Inactive';

    $toggleButton = '<button class="btn btn-sm ' . $buttonClass . ' toggle-active" data-id="' . $aRow['id'] . '" data-active="' . $aRow['active'] . '">' . $buttonText . '</button>';

    $requiresDocument = isset($aRow['requires_document']) ? (int) $aRow['requires_document'] : 0;
    $requiresClass = $requiresDocument === 1 ? 'btn-warning' : 'btn-default';
    $requiresText = $requiresDocument === 1 ? 'Required' : 'Optional';
    $requiresButton = '<button class="btn btn-sm ' . $requiresClass . ' toggle-requires-document" data-id="' . $aRow['id'] . '" data-requires-document="' . $requiresDocument . '">' . $requiresText . '</button>';

    $row[] = $toggleButton;
    $row[] = $requiresButton;

    $output['aaData'][] = $row;
}


echo json_encode($output);
