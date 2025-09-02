<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
$pdo = db();
$doctors = $pdo->query("SELECT * FROM doctors ORDER BY name ASC")->fetchAll();
$records = $pdo->query("SELECT * FROM medical_records ORDER BY visit_date DESC LIMIT 100")->fetchAll();
echo json_encode(['doctors'=>$doctors,'records'=>$records]);
?>

