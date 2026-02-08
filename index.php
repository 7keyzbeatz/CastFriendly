<?php
require "auth.php";

$path = __DIR__ . "/data/brands.json";

if (!file_exists($path)) {
    $data = ["meta" => [], "brands" => []];
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}

$json = file_get_contents($path);
$json = preg_replace('/^\xEF\xBB\xBF/', '', $json);
$data = json_decode($json, true);

$brands = $data["brands"] ?? [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin – Casinos</title>
<link rel="stylesheet" href="admin.css">
</head>
<body>

<h1>Casinos</h1>
<a href="edit.php">➕ Add New</a>

<?php if (empty($brands)): ?>
    <p>⚠️ No casinos yet</p>
<?php else: ?>
<ul>
<?php foreach ($brands as $b): ?>
<li>
    <strong><?= htmlspecialchars($b["name"]) ?></strong>
    <a href="edit.php?id=<?= $b["id"] ?>">✏️</a>
    <a href="delete.php?id=<?= $b["id"] ?>" onclick="return confirm('Delete?')">🗑️</a>
</li>
<?php endforeach ?>
</ul>
<?php endif; ?>

</body>
</html>