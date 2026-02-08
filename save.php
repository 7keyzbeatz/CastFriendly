<?php
require "auth.php";

$path = __DIR__ . "/data/brands.json";

if (!file_exists($path)) {
    $data = ["meta" => [], "brands" => []];
} else {
    $json = file_get_contents($path);
    $json = preg_replace('/^\xEF\xBB\xBF/', '', $json);
    $data = json_decode($json, true) ?: ["meta" => [], "brands" => []];
}

$brands = &$data["brands"];

/* id logic */
$id = $_POST["original_id"] ?: strtolower(preg_replace("/[^a-z0-9]+/i", "-", $_POST["name"]));

$found = false;
foreach ($brands as &$b) {
    if ($b["id"] === $id) {
        $found = true;
        break;
    }
}

if (!$found) {
    $b = ["id" => $id];
    $brands[] = &$b;
}

/* BASIC */
$b["name"] = $_POST["name"];
$b["rank"] = $_POST["rank"];
$b["company"]["owner"] = $_POST["owner"];
$b["company"]["established"] = (int) $_POST["established"];

/* FEATURES */
$b["features"]["vpnFriendly"] = $_POST["vpn"] == "1";
$b["features"]["languages"] = $_POST["languages"] ?? [];

/* BONUS */
$b["bonus"] = [
    "percentage" => (int) $_POST["bonus_percentage"],
    "maxAmount" => (int) $_POST["bonus_max"],
    "freeSpins" => (int) $_POST["bonus_spins"],
    "wager" => (int) $_POST["bonus_wager"],
    "code" => null
];

/* WITHDRAWALS */
$b["withdrawals"] = [];
if (!empty($_POST["wd_day"]))
    $b["withdrawals"]["perDay"] = ["amount" => (int) $_POST["wd_day"], "currency" => "EUR"];
if (!empty($_POST["wd_week"]))
    $b["withdrawals"]["perWeek"] = ["amount" => (int) $_POST["wd_week"], "currency" => "EUR"];
if (!empty($_POST["wd_month"]))
    $b["withdrawals"]["perMonth"] = ["amount" => (int) $_POST["wd_month"], "currency" => "EUR"];

/* UPLOAD */
function uploadImage($field, $folder)
{
    if (!isset($_FILES[$field]) || $_FILES[$field]["error"] !== UPLOAD_ERR_OK)
        return null;

    $ext = strtolower(pathinfo($_FILES[$field]["name"], PATHINFO_EXTENSION));
    if (!in_array($ext, ["png", "jpg", "jpeg", "webp"]))
        return null;

    $name = time() . "_" . rand(1000, 9999) . "." . $ext;
    $dir = __DIR__ . "/uploads/$folder/";

    if (!is_dir($dir))
        mkdir($dir, 0777, true);
    move_uploaded_file($_FILES[$field]["tmp_name"], $dir . $name);

    return "/admin/uploads/$folder/$name";
}

if ($logo = uploadImage("logo", "logos")) {
    $b["media"]["logo"] = $logo;
}
if ($bg = uploadImage("background", "backgrounds")) {
    $b["media"]["background"] = $bg;
}

/* SAVE */
file_put_contents(
    $path,
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

header("Location: index.php");
exit;