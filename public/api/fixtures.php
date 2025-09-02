<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
$pdo = db();
$scope = $_GET['scope'] ?? 'all';
$sql = "SELECT * FROM fixtures";
if ($scope === 'upcoming') { $sql .= " WHERE match_date>=CURDATE()"; }
elseif ($scope === 'past') { $sql .= " WHERE match_date<CURDATE()"; }
$sql .= " ORDER BY match_date ".($scope==='past'?'DESC':'ASC');
$rows = $pdo->query($sql)->fetchAll();
echo json_encode($rows);
?>

