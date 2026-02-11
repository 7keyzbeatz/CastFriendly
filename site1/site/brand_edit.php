<?php
require_once dirname(__DIR__) . '/lib/brands.lib.php';

$id = $_GET['id'] ?? die('Missing id');

$data = loadBrands();
$brand = getBrandById($id);
if (!$brand)
    die('Brand not found');

$mode = 'edit';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $updated = buildBrandFromPost($_POST, $_FILES, $data['meta']);

    foreach ($data['brands'] as &$b) {
        if ($b['id'] === $id) {
            $b = $updated;
            break;
        }
    }

    saveBrands($data);
    header('Location: brands_manager.php');
    exit;
}

require dirname(__DIR__) . '/templates/brand_form.html.php';