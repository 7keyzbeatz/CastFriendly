<?php
require "auth.php";

$path = __DIR__ . "/data/brands.json";

if (!file_exists($path)) {
    $data = ["meta" => [], "brands" => []];
} else {
    $json = file_get_contents($path);
    $json = preg_replace('/^\xEF\xBB\xBF/', '', $json); // BOM fix
    $data = json_decode($json, true) ?: ["meta" => [], "brands" => []];
}

$brands = $data["brands"] ?? [];

/* find brand */
$brand = null;
if (isset($_GET["id"])) {
    foreach ($brands as $b) {
        if ($b["id"] === $_GET["id"]) {
            $brand = $b;
            break;
        }
    }
}

/* defaults */
$brand = $brand ?? [
    "id" => "",
    "rank" => "",
    "name" => "",
    "media" => ["logo" => "", "background" => ""],
    "company" => ["owner" => "", "established" => ""],
    "licenses" => [],
    "features" => ["vpnFriendly" => false, "languages" => []],
    "bonus" => ["percentage" => "", "maxAmount" => "", "freeSpins" => "", "wager" => "", "code" => ""],
    "withdrawals" => []
];

$languages = $brand["features"]["languages"] ?? [];
function checked($v, $arr)
{
    return in_array($v, $arr) ? "checked" : "";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title><?= $brand["id"] ? "Edit" : "Add" ?> Casino</title>
<style>
body{font-family:system-ui;background:#0b0e13;color:#fff;padding:40px}
label{display:block;margin-top:12px;font-weight:600}
input,select{width:100%;padding:8px;margin-top:4px}
h3{margin-top:30px}
button{margin-top:24px;padding:10px 18px;font-weight:800}
</style>
</head>
<body>

<h1><?= $brand["id"] ? "Edit" : "Add" ?> Casino</h1>

<form method="post" action="save.php" enctype="multipart/form-data">

<input type="hidden" name="original_id" value="<?= htmlspecialchars($brand["id"]) ?>">

<label>Name
<input name="name" required value="<?= htmlspecialchars($brand["name"]) ?>">
</label>

<label>Rank
<input name="rank" value="<?= htmlspecialchars($brand["rank"]) ?>">
</label>

<label>Owner
<input name="owner" value="<?= htmlspecialchars($brand["company"]["owner"]) ?>">
</label>

<label>Established
<input type="number" name="established" value="<?= htmlspecialchars($brand["company"]["established"]) ?>">
</label>

<label>VPN Friendly
<select name="vpn">
<option value="0">No</option>
<option value="1" <?= $brand["features"]["vpnFriendly"] ? "selected" : "" ?>>Yes</option>
</select>
</label>

<h3>Languages</h3>
<label><input type="checkbox" name="languages[]" value="Greek" <?= checked("Greek", $languages) ?>> Greek</label>
<label><input type="checkbox" name="languages[]" value="English" <?= checked("English", $languages) ?>> English</label>

<h3>Bonus</h3>
<input name="bonus_percentage" placeholder="%" value="<?= $brand["bonus"]["percentage"] ?>">
<input name="bonus_max" placeholder="Max €" value="<?= $brand["bonus"]["maxAmount"] ?>">
<input name="bonus_spins" placeholder="Free Spins" value="<?= $brand["bonus"]["freeSpins"] ?>">
<input name="bonus_wager" placeholder="Wager" value="<?= $brand["bonus"]["wager"] ?>">

<h3>Withdrawals (€)</h3>
<input name="wd_day" placeholder="Per Day" value="<?= $brand["withdrawals"]["perDay"]["amount"] ?? "" ?>">
<input name="wd_week" placeholder="Per Week" value="<?= $brand["withdrawals"]["perWeek"]["amount"] ?? "" ?>">
<input name="wd_month" placeholder="Per Month" value="<?= $brand["withdrawals"]["perMonth"]["amount"] ?? "" ?>">

<h3>Media</h3>
<label>Logo <input type="file" name="logo"></label>
<label>Background <input type="file" name="background"></label>

<button type="submit">💾 Save</button>
<a href="index.php">⬅ Back</a>

</form>
</body>
</html>