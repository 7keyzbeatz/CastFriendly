<?php
require_once dirname(__DIR__) . '/lib/brands.lib.php';

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

require dirname(__DIR__) . '/templates/brands_list.html.php';