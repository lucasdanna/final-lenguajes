<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
$pdo = db();
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id) {
  $stmt = $pdo->prepare("SELECT * FROM news WHERE id=?");
  $stmt->execute([$id]);
  echo json_encode($stmt->fetch());
  exit;
}
$limit = (int)($_GET['limit'] ?? 20);
if ($limit < 1 || $limit > 200) $limit = 20;
$stmt = $pdo->prepare("SELECT id,title,body,image_url,published_at FROM news ORDER BY published_at DESC LIMIT ?");
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();
echo json_encode($stmt->fetchAll());
?>

