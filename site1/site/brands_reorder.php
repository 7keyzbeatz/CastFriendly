<?php
require_once dirname(__DIR__) . '/lib/brands.lib.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['order']) || !is_array($input['order'])) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

$data = loadBrands();

/* κάνουμε map μόνο για να βρούμε references */
$map = [];
foreach ($data['brands'] as $brand) {
    $map[$brand['id']] = $brand;
}

/* rebuild array ΜΟΝΟ με νέα σειρά */
$newBrands = [];
foreach ($input['order'] as $id) {
    if (isset($map[$id])) {
        $newBrands[] = $map[$id];
    }
}

/* safety: αν λείπει κάτι, το κολλάμε στο τέλος */
if (count($newBrands) !== count($data['brands'])) {
    foreach ($data['brands'] as $brand) {
        if (!in_array($brand, $newBrands, true)) {
            $newBrands[] = $brand;
        }
    }
}

$data['brands'] = $newBrands;
saveBrands($data);

echo json_encode(['success' => true]);