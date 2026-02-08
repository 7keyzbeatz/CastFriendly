<?php
session_start();

$ADMIN_PASS = "1234"; // άλλαξέ το

if (isset($_POST['password'])) {
    if ($_POST['password'] === $ADMIN_PASS) {
        $_SESSION['admin'] = true;
        header("Location: index.php");
        exit;
    }
}

if (!isset($_SESSION['admin'])) {
    header("Location: login.php");
    exit;
}