<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// ---- CSRF ----
function csrf_token(): string {
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
  return $_SESSION['csrf'];
}
function csrf_ok(): bool {
  return isset($_POST['csrf']) && hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf']);
}

// ---- Helpers ----
function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function is_post(){ return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST'; }
function role(): string { return $_SESSION['user']['role'] ?? 'guest'; }
function asset_url(string $path): string {
  $base = rtrim(str_replace('\\','/', dirname($_SERVER['SCRIPT_NAME'] ?? '')),'/');
  $path = '/'.ltrim(str_replace('\\','/',$path),'/');
  return ($base?:'').$path;
}
function asset_image(?string $url, string $placeholder): string {
  $u = trim((string)($url ?? ''));
  if ($u==='') return $placeholder;
  if (preg_match('~^(https?:)?//|^data:~i', $u)) return $u;
  if ($u[0] === '/') return $u;
  return asset_url($u);
}
function save_upload(string $fieldName, string $subdir='misc'): ?string {
  if (empty($_FILES[$fieldName]) || ($_FILES[$fieldName]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) return null;
  $tmp = $_FILES[$fieldName]['tmp_name'];
  $orig = $_FILES[$fieldName]['name'] ?? 'file';
  $size = (int)($_FILES[$fieldName]['size'] ?? 0);
  if ($size <= 0 || $size > 8*1024*1024) return null; // máx 8MB
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $tmp) ?: '';
  finfo_close($finfo);
  $allowed = ['image/jpeg'=>'.jpg','image/png'=>'.png','image/gif'=>'.gif','image/webp'=>'.webp'];
  if (!isset($allowed[$mime])) return null;
  $ext = $allowed[$mime];
  $safeBase = preg_replace('~[^a-z0-9]+~i','-', pathinfo($orig, PATHINFO_FILENAME));
  $name = $safeBase.'-'.bin2hex(random_bytes(6)).$ext;
  $baseDir = dirname(__DIR__).DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR.$subdir;
  if (!is_dir($baseDir)) @mkdir($baseDir, 0775, true);
  $dest = $baseDir.DIRECTORY_SEPARATOR.$name;
  if (!@move_uploaded_file($tmp, $dest)) return null;
  return 'uploads/'.$subdir.'/'.$name; // URL relativa
}
function require_login(){
  if (empty($_SESSION['user'])) { header('Location: ?page=login'); exit; }
}
function can($perm): bool {
  $r = role();
  return match($perm){
    'players_create','players_edit','fixtures_manage' => in_array($r, ['admin','entrenador',]),
    'players_delete','news_manage' => in_array($r, ['admin']),
    'merchandise_manage','doctors_manage' => in_array($r, ['admin']),
    'medical_records_manage' => in_array($r, ['admin','enfermero','kinesiologo','nutricionista','psicologo','fisioterapeuta','masajista','preparador_fisico']),
    'users_manage' => $r==='admin',
    'team_management' => in_array($r, ['admin','manager']),
    'view' => $r!=='guest',
    default => false
  };
}
function flash($msg=null,$type='success'){
  if ($msg!==null) { $_SESSION['flash'][]=['t'=>$type,'m'=>$msg]; return; }
  $items = $_SESSION['flash']??[]; unset($_SESSION['flash']); return $items;
}
?>

