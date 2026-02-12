<?php

date_default_timezone_set("Europe/Athens");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Μη έγκυρη πρόσβαση.");
}

/* ================= GET DATA ================= */

$giveawayId = $_POST["giveaway_id"] ?? "";
$giveawayTitle = $_POST["giveaway_title"] ?? "";
$name = trim($_POST["username_email"] ?? "");
$casino = trim($_POST["casino"] ?? "");

if (!$giveawayId || !$giveawayTitle || !$name || !$casino) {
    die("Λείπουν πεδία.");
}

if (!isset($_FILES["deposit_screenshot"])) {
    die("Δεν ανέβηκε αρχείο.");
}

$file = $_FILES["deposit_screenshot"];

if ($file["error"] !== UPLOAD_ERR_OK) {
    die("Σφάλμα upload.");
}

/* ================= VALIDATION ================= */

$allowed = ["image/jpeg", "image/png", "image/webp"];
if (!in_array($file["type"], $allowed)) {
    die("Μη αποδεκτός τύπος εικόνας.");
}

if ($file["size"] > 5 * 1024 * 1024) {
    die("Μέγιστο μέγεθος 5MB.");
}

/* ================= FOLDER STRUCTURE ================= */

$cleanGiveaway = preg_replace('/[^A-Za-z0-9_]/', '_', $giveawayTitle);
$cleanCasino = preg_replace('/[^A-Za-z0-9_]/', '_', $casino);
$cleanName = preg_replace('/[^A-Za-z0-9_]/', '_', $name);

$baseDir = __DIR__ . "/giveaways_uploads/";
$giveawayDir = $baseDir . $cleanGiveaway . "/";
$casinoDir = $giveawayDir . $cleanCasino . "/";

if (!is_dir($casinoDir)) {
    mkdir($casinoDir, 0755, true);
}

/* ================= FILE NAME WITH TIMESTAMP ================= */

$timestamp = date("Y-m-d_H-i-s");
$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

$newName = "entry_" . $timestamp . "_" . $cleanName . "." . $ext;
$destination = $casinoDir . $newName;

if (!move_uploaded_file($file["tmp_name"], $destination)) {
    die("Αποτυχία αποθήκευσης.");
}

/* ================= CSV FILES ================= */

$relativePath = "giveaways_uploads/$cleanGiveaway/$cleanCasino/$newName";

$row = [
    date("Y-m-d H:i:s"),
    $name,
    $casino,
    $relativePath
];

/* === CASINO CSV === */
$casinoCsv = $casinoDir . "entries.csv";
$fp = fopen($casinoCsv, "a");

if (filesize($casinoCsv) == 0) {
    fputcsv($fp, ["Date", "Name", "Casino", "Screenshot"]);
}
fputcsv($fp, $row);
fclose($fp);

/* === MASTER CSV === */
$masterCsv = $giveawayDir . "master.csv";
$fp2 = fopen($masterCsv, "a");

if (filesize($masterCsv) == 0) {
    fputcsv($fp2, ["Date", "Name", "Casino", "Screenshot"]);
}
fputcsv($fp2, $row);
fclose($fp2);

/* ================= SUCCESS PAGE ================= */

echo '
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Success</title>
<style>
body {
    background:#020617;
    color:#fff;
    font-family:Inter;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    text-align:center;
}
.card {
    background:#0f172a;
    padding:40px;
    border-radius:20px;
    box-shadow:0 30px 80px rgba(0,0,0,.7);
}
.btn {
    display:inline-block;
    margin-top:20px;
    padding:12px 28px;
    border-radius:999px;
    background:linear-gradient(135deg,#f5a524,#ffcc70);
    color:#000;
    text-decoration:none;
    font-weight:900;
}
</style>
</head>
<body>
<div class="card">
<h2>Η συμμετοχή καταχωρήθηκε επιτυχώς!</h2>
<p>Καλή επιτυχία 🔥</p>
<a class="btn" href="giveaways.html">Επιστροφή</a>
</div>
</body>
</html>
';