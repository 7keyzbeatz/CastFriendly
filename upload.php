<?php
$target = "../uploads/" . ($_GET["type"] === "bg" ? "backgrounds" : "logos") . "/";
$name = uniqid() . "_" . basename($_FILES["file"]["name"]);
move_uploaded_file($_FILES["file"]["tmp_name"], $target . $name);
echo $name;