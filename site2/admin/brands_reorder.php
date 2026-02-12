<?php
// Σωστό path για να βρει τη βιβλιοθήκη από το φάκελο site
require_once '../lib/brands.lib.php';

header('Content-Type: application/json');

// Λήψη των δεδομένων από το fetch (JSON)
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['order']) || !is_array($input['order'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid order data']);
    exit;
}

$data = loadBrands();
$currentBrands = $data['brands'] ?? [];

/* 1. Δημιουργούμε ένα map με κλειδί το ID για ταχύτητα */
$map = [];
foreach ($currentBrands as $brand) {
    $map[$brand['id']] = $brand;
}

/* 2. Χτίζουμε τη νέα λίστα βάσει της σειράς που ήρθε από το JS */
$newOrderIds = $input['order'];
$newBrands = [];

foreach ($newOrderIds as $id) {
    if (isset($map[$id])) {
        $newBrands[] = $map[$id];
        unset($map[$id]); // Το βγάζουμε από το map για να ξέρουμε τι περίσσεψε
    }
}

/* 3. Safety: Αν κάποιο brand υπήρχε στο αρχείο αλλά ΔΕΝ ήρθε στο fetch, 
      το προσθέτουμε στο τέλος για να μη χαθεί τίποτα */
if (!empty($map)) {
    foreach ($map as $remainingBrand) {
        $newBrands[] = $remainingBrand;
    }
}

/* 4. Αποθήκευση */
$data['brands'] = $newBrands;
saveBrands($data, true); // True για version bump, ώστε το Android app να δει την αλλαγή

echo json_encode(['success' => true]);