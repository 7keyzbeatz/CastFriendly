<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../lib/brands.lib.php';

$data = loadBrands();

/* DELETE */
if (isset($_GET['delete'])) {
    $data['brands'] = array_values(array_filter(
        $data['brands'],
        fn($b) => $b['id'] !== $_GET['delete']
    ));
    saveBrands($data);
    header('Location: brands_manager.php');
    exit;
}

$brands = $data['brands'];

require '../templates/brands_list.html.php';