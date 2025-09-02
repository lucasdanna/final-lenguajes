<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
$pdo = db();
$rows = $pdo->query("SELECT * FROM events ORDER BY start_datetime ASC LIMIT 200")->fetchAll();
echo json_encode($rows);
?>

