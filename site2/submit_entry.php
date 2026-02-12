<?php

/* =====================================================
   RENDER MESSAGE FUNCTION
===================================================== */

function renderMessage($message, $success = true)
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
            <?= $success ? "Η Συμμετοχή Καταχωρήθηκε ✅" : "Σφάλμα Υποβολής ❌" ?>
        </h1>

        <div class="form-message <?= $success ? "form-success" : "form-error" ?>">
            <?= htmlspecialchars($message) ?>
        </div>

        <div style="margin-top:30px; text-align:center;">
            <a href="giveaways.html"
               style="display:inline-block;padding:14px 28px;border-radius:999px;
               background:linear-gradient(135deg,#f5a524,#ffcc70);
               color:#000;font-weight:900;text-decoration:none;">
                Επιστροφή στα Giveaways
            </a>
        </div>

    </div>

    </body>
    </html>
    <?php
    exit;
}

/* =====================================================
   METHOD CHECK
===================================================== */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    renderMessage("Μη έγκυρη πρόσβαση.", false);
}

/* =====================================================
   BASIC INPUTS
===================================================== */

$giveawayId = $_POST["giveaway_id"] ?? "";
$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$casino = trim($_POST["casino"] ?? "");
$deposit = floatval($_POST["deposit"] ?? 0);

if (!$giveawayId || !$username || !$email || !$casino || $deposit <= 0) {
    renderMessage("Συμπλήρωσε σωστά όλα τα πεδία.", false);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    renderMessage("Μη έγκυρο email.", false);
}

/* =====================================================
   LOAD JSON
===================================================== */

$jsonPath = "data/giveaways.json";

if (!file_exists($jsonPath)) {
    renderMessage("Δεν βρέθηκε το giveaways.json.", false);
}

$jsonRaw = file_get_contents($jsonPath);
$jsonRaw = preg_replace('/^\xEF\xBB\xBF/', '', $jsonRaw);
$data = json_decode($jsonRaw, true);

if (!$data || !isset($data["giveaways"])) {
    renderMessage("Σφάλμα δομής JSON.", false);
}

/* =====================================================
   FIND GIVEAWAY
===================================================== */

$giveaway = null;

foreach ($data["giveaways"] as $g) {
    if ($g["id"] === $giveawayId) {
        $giveaway = $g;
        break;
    }
}

if (!$giveaway) {
    renderMessage("Το giveaway δεν βρέθηκε.", false);
}

/* =====================================================
   VALIDATE CASINO FROM JSON (SECURITY)
===================================================== */

if (!isset($giveaway["casinos"]) || !in_array($casino, $giveaway["casinos"])) {
    renderMessage("Μη έγκυρη επιλογή καζίνο.", false);
}

/* =====================================================
   CALCULATE ENTRIES
===================================================== */

if (!isset($giveaway["entriesTable"]) || !is_array($giveaway["entriesTable"])) {
    renderMessage("Δεν υπάρχουν κανόνες συμμετοχών.", false);
}

$entriesCount = 0;
$minimumDeposit = PHP_INT_MAX;

foreach ($giveaway["entriesTable"] as $rule) {

    $ruleDeposit = floatval($rule["deposit"]);

    if ($ruleDeposit < $minimumDeposit) {
        $minimumDeposit = $ruleDeposit;
    }

    if ($deposit >= $ruleDeposit) {
        $entriesCount = intval($rule["entries"]);
    }
}

if ($deposit < $minimumDeposit) {
    renderMessage("Η ελάχιστη κατάθεση είναι {$minimumDeposit}€.", false);
}

/* =====================================================
   FILE VALIDATION (REAL MIME CHECK)
===================================================== */

if (!isset($_FILES["screenshot"])) {
    renderMessage("Δεν ανέβηκε screenshot.", false);
}

$file = $_FILES["screenshot"];

if ($file["error"] !== UPLOAD_ERR_OK) {
    renderMessage("Σφάλμα upload αρχείου.", false);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$realMime = finfo_file($finfo, $file["tmp_name"]);
finfo_close($finfo);

$allowed = ["image/jpeg", "image/png"];

if (!in_array($realMime, $allowed)) {
    renderMessage("Μόνο JPG ή PNG επιτρέπονται.", false);
}

if ($file["size"] > 5 * 1024 * 1024) {
    renderMessage("Μέγιστο μέγεθος 5MB.", false);
}

/* =====================================================
   CREATE FOLDERS
===================================================== */

$giveawayFolder = preg_replace('/[^A-Za-z0-9_\-]/', '_', $giveaway["title"]);
$casinoFolder = preg_replace('/[^A-Za-z0-9_\-]/', '_', $casino);

$baseDir = __DIR__ . "/giveaways/" . $giveawayFolder . "/";
$casinoDir = $baseDir . $casinoFolder . "/";

if (!is_dir($casinoDir)) {
    mkdir($casinoDir, 0755, true);
}

/* =====================================================
   SAVE FILE WITH TIMESTAMP
===================================================== */

$timestamp = date("Y-m-d_H-i-s");
$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
$newFileName = $timestamp . "_" . uniqid() . "." . $ext;

if (!move_uploaded_file($file["tmp_name"], $casinoDir . $newFileName)) {
    renderMessage("Αποτυχία αποθήκευσης αρχείου.", false);
}

$relativePath = "giveaways/" . $giveawayFolder . "/" . $casinoFolder . "/" . $newFileName;

/* =====================================================
   CSV WRITE
===================================================== */

function writeCSV($file, $row)
{
    $isNew = !file_exists($file);
    $fp = fopen($file, "a");

    if ($isNew) {
        fputcsv($fp, ["Username", "Email", "Casino", "Deposit", "Entries", "Screenshot", "Date"]);
    }

    fputcsv($fp, $row);
    fclose($fp);
}

writeCSV($casinoDir . "entries.csv", [
    $username,
    $email,
    $casino,
    $deposit,
    $entriesCount,
    $relativePath,
    date("Y-m-d H:i:s")
]);

writeCSV($baseDir . "TOTAL_entries.csv", [
    $username,
    $email,
    $casino,
    $deposit,
    $entriesCount,
    $relativePath,
    date("Y-m-d H:i:s")
]);

/* =====================================================
   SUCCESS
===================================================== */

renderMessage("Πήρες {$entriesCount} συμμετοχές 🎉", true);