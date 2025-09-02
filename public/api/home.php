<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';

$pdo = db();

$overview = [
  'players' => (int)$pdo->query("SELECT COUNT(*) c FROM players")->fetch()['c'],
  'goals' => (int)$pdo->query("SELECT COALESCE(SUM(goals),0) s FROM players")->fetch()['s'],
  'assists' => (int)$pdo->query("SELECT COALESCE(SUM(assists),0) s FROM players")->fetch()['s'],
  'news' => (int)$pdo->query("SELECT COUNT(*) c FROM news")->fetch()['c'],
  'fixtures' => (int)$pdo->query("SELECT COUNT(*) c FROM fixtures")->fetch()['c'],
  'doctors' => (int)$pdo->query("SELECT COUNT(*) c FROM doctors")->fetch()['c'],
  'medical_recent' => (int)$pdo->query("SELECT COUNT(*) c FROM medical_records WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)")->fetch()['c'],
];

$news = $pdo->query("SELECT id,title,body,image_url,published_at FROM news ORDER BY published_at DESC LIMIT 6")->fetchAll();
$fixtures = $pdo->query("SELECT id,match_date,opponent,venue,home_away,competition,notes FROM fixtures WHERE match_date>=CURDATE() ORDER BY match_date ASC LIMIT 6")->fetchAll();
$top_scorers = $pdo->query("SELECT id,name,position,player_number,goals,assists,image_url,nationality FROM players ORDER BY goals DESC, assists DESC, name ASC LIMIT 5")->fetchAll();
$merch_latest = $pdo->query("SELECT id,name,category,price,image_url FROM merchandise ORDER BY created_at DESC LIMIT 6")->fetchAll();

echo json_encode([
  'overview' => $overview,
  'news' => $news,
  'fixtures' => $fixtures,
  'top_scorers' => $top_scorers,
  'merch_latest' => $merch_latest,
]);
?>

