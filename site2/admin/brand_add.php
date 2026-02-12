<?php
require_once '../lib/brands.lib.php';

/* =====================================================
   MESSAGE RENDERER
===================================================== */
function renderMessage(string $message, bool $success = false): void
{
    ?>
    <!DOCTYPE html>
    <html lang="el">
    <head>
        <meta charset="UTF-8">
        <title><?= $success ? "Επιτυχία" : "Σφάλμα" ?></title>
        <link rel="stylesheet" href="css/submit.css">
    </head>
    <body class="message-page">

    <div class="form-wrapper">

        <h1>
            <?= $success ? "Επιτυχία ✅" : "Σφάλμα ❌" ?>
        </h1>

        <div class="form-message <?= $success ? "form-success" : "form-error" ?>">
            <?= htmlspecialchars($message) ?>
        </div>

        <div style="margin-top:30px; text-align:center;">
            <a href="brands_manager.php"
               style="display:inline-block;padding:14px 28px;border-radius:999px;
               background:linear-gradient(135deg,#f5a524,#ffcc70);
               color:#000;font-weight:900;text-decoration:none;">
                Επιστροφή
            </a>
        </div>

    </div>

    </body>
    </html>
    <?php
    exit;
}

/* =====================================================
   LOAD DATA
===================================================== */
$data = loadBrands();
$brand = emptyBrand();
$mode = 'add';

/* =====================================================
   HANDLE POST
===================================================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id = trim($_POST['id'] ?? '');

    if ($id === '') {
        renderMessage("Το ID είναι υποχρεωτικό.", false);
    }

    foreach ($data['brands'] as $b) {
        if ($b['id'] === $id) {
            renderMessage("Το ID υπάρχει ήδη.", false);
        }
    }

    try {
        $brand = buildBrandFromPost($_POST, $_FILES, $data['meta']);
        $data['brands'][] = $brand;

        saveBrands($data);

        header('Location: brands_manager.php');
        exit;

    } catch (Throwable $e) {
        renderMessage($e->getMessage(), false);
    }
}

/* =====================================================
   TEMPLATE
===================================================== */
require '../templates/brand_form.html.php';