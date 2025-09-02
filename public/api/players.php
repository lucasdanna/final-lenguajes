<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
$pdo = db();
$q = trim($_GET['q'] ?? '');
$position = $_GET['position'] ?? '';
$sql = "SELECT * FROM players WHERE 1";
$args = [];
if ($q !== '') { $sql .= " AND name LIKE ?"; $args[] = '%'.$q.'%'; }
if (in_array($position, ['Arquero','Defensa','Mediocampista','Delantero'])) { $sql .= " AND position=?"; $args[] = $position; }
$sql .= " ORDER BY goals DESC, assists DESC, name ASC";
$stmt = $pdo->prepare($sql); $stmt->execute($args);
echo json_encode($stmt->fetchAll());
?>

