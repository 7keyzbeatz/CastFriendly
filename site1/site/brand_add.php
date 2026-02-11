<?php
require_once dirname(__DIR__) . '/lib/brands.lib.php';

$data = loadBrands();
$brand = emptyBrand();
$mode = 'add';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    foreach ($data['brands'] as $b) {
        if ($b['id'] === $_POST['id']) {
            die('ID already exists');
        }
    }

    $brand = buildBrandFromPost($_POST, $_FILES, $data['meta']);
    $data['brands'][] = $brand;

    saveBrands($data);
    header('Location: brands_manager.php');
    exit;
}

require dirname(__DIR__) . '/templates/brand_form.html.php';