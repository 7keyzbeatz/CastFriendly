<?php
require "auth.php";

$path = __DIR__ . "/data/brands.json";
$data = json_decode(file_get_contents($path), true);

$data["brands"] = array_values(array_filter(
    $data["brands"],
    fn($b) => $b["id"] !== $_GET["id"]
));

file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
header("Location: index.php");