<?php
require_once __DIR__.'/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';

if (is_post() && !csrf_ok()) { flash('CSRF inválido. Refresca la página e intenta de nuevo.', 'error'); header('Location: '.($_SERVER['HTTP_REFERER']??'?')); exit; }

if (!is_post()) return;

$pdo = db();
$action = $_POST['action'] ?? '';

try {
  switch ($action) {
    // Auth
    case 'register':
      $name = trim($_POST['name'] ?? '');
      $email = trim($_POST['email'] ?? '');
      $pass = $_POST['password'] ?? '';
      $roleSel = $_POST['role'] ?? 'jugador';
      if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception('Email inválido');
      if (!in_array($roleSel,['admin','entrenador','jugador','enfermero','kinesiologo','nutricionista','psicologo','fisioterapeuta','masajista','preparador_fisico','manager'])) $roleSel='jugador';
      $prefix = match($roleSel) {
        'admin' => 'ADM','entrenador' => 'ENT','jugador' => 'JUG','enfermero' => 'ENF',
        'kinesiologo' => 'KIN','nutricionista' => 'NUT','psicologo' => 'PSI','fisioterapeuta' => 'FIS',
        'masajista' => 'MAS','preparador_fisico' => 'PRE','manager' => 'MGR', default => 'USR'
      };
      $stmt = $pdo->prepare("SELECT COUNT(*) c FROM users WHERE role = ?");
      $stmt->execute([$roleSel]);
      $count = $stmt->fetch()['c'];
      $userNumber = $prefix . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
      $stmt=$pdo->prepare("INSERT INTO users(name,email,password_hash,role,user_number) VALUES(?,?,?,?,?)");
      $stmt->execute([$name,$email,password_hash($pass,PASSWORD_DEFAULT),$roleSel,$userNumber]);
      flash('Registro exitoso. Tu número de usuario es: ' . $userNumber . '. Ya podés iniciar sesión.');
      header('Location: ?page=login'); exit;

    case 'login':
      $email = trim($_POST['email'] ?? ''); $pass = $_POST['password'] ?? '';
      $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?"); $stmt->execute([$email]);
      $u = $stmt->fetch();
      if (!$u || !password_verify($pass, $u['password_hash'])) throw new Exception('Credenciales inválidas');
      $_SESSION['user']=['id'=>$u['id'],'name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role']];
      flash('Bienvenido, '.$u['name']); header('Location: ?page=dashboard'); exit;

    case 'logout':
      session_destroy(); session_start(); flash('Sesión cerrada.'); header('Location: ?'); exit;

    // Players
    case 'player_create':
      if (!can('players_create')) throw new Exception('No autorizado');
      $img = save_upload('image_file','players') ?? trim($_POST['image_url']);
      $stmt=$pdo->prepare("INSERT INTO players(name,position,player_number,goals,assists,yellow_cards,red_cards,injuries,image_url,height,weight,birth_date,nationality) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
      $stmt->execute([
        trim($_POST['name']), $_POST['position'], (int)$_POST['player_number'],
        (int)$_POST['goals'], (int)$_POST['assists'], (int)$_POST['yellow_cards'], (int)$_POST['red_cards'],
        trim($_POST['injuries']), $img, 
        $_POST['height'] ? (float)$_POST['height'] : null, $_POST['weight'] ? (float)$_POST['weight'] : null,
        $_POST['birth_date'] ?: null, trim($_POST['nationality'])
      ]);
      flash('Jugador agregado.');
      header('Location: ?page=players'); exit;

    case 'player_update':
      if (!can('players_edit')) throw new Exception('No autorizado');
      $newImg = save_upload('image_file','players');
      $imgUrl = $newImg ?? trim($_POST['image_url']);
      $stmt=$pdo->prepare("UPDATE players SET name=?, position=?, player_number=?, goals=?, assists=?, yellow_cards=?, red_cards=?, injuries=?, image_url=?, height=?, weight=?, birth_date=?, nationality=? WHERE id=?");
      $stmt->execute([
        trim($_POST['name']), $_POST['position'], (int)$_POST['player_number'],
        (int)$_POST['goals'], (int)$_POST['assists'], (int)$_POST['yellow_cards'], (int)$_POST['red_cards'],
        trim($_POST['injuries']), $imgUrl, 
        $_POST['height'] ? (float)$_POST['height'] : null, $_POST['weight'] ? (float)$_POST['weight'] : null,
        $_POST['birth_date'] ?: null, trim($_POST['nationality']), (int)$_POST['id']
      ]);
      flash('Jugador actualizado.');
      header('Location: ?page=players'); exit;

    case 'player_delete':
      if (!can('players_delete')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("DELETE FROM players WHERE id=?");
      $stmt->execute([(int)$_POST['id']]);
      flash('Jugador eliminado.');
      header('Location: ?page=players'); exit;

    // News
    case 'news_create':
      if (!can('news_manage')) throw new Exception('No autorizado');
      $img = save_upload('image_file','news') ?? trim($_POST['image_url']);
      $stmt=$pdo->prepare("INSERT INTO news(title,body,image_url) VALUES(?,?,?)");
      $stmt->execute([trim($_POST['title']), trim($_POST['body']), $img]);
      flash('Noticia publicada.');
      header('Location: ?page=news'); exit;

    case 'news_update':
      if (!can('news_manage')) throw new Exception('No autorizado');
      $newImg = save_upload('image_file','news');
      $imgUrl = $newImg ?? trim($_POST['image_url']);
      $stmt=$pdo->prepare("UPDATE news SET title=?, body=?, image_url=? WHERE id=?");
      $stmt->execute([trim($_POST['title']), trim($_POST['body']), $imgUrl, (int)$_POST['id']]);
      flash('Noticia actualizada.');
      header('Location: ?page=news'); exit;

    case 'news_delete':
      if (!can('news_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("DELETE FROM news WHERE id=?");
      $stmt->execute([(int)$_POST['id']]);
      flash('Noticia eliminada.');
      header('Location: ?page=news'); exit;

    // Fixtures
    case 'fixture_create':
      if (!can('fixtures_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("INSERT INTO fixtures(match_date,opponent,venue,home_away,competition,notes) VALUES(?,?,?,?,?,?)");
      $stmt->execute([$_POST['match_date'], trim($_POST['opponent']), trim($_POST['venue']), $_POST['home_away'], trim($_POST['competition']), trim($_POST['notes'])]);
      flash('Partido agregado.');
      header('Location: ?page=fixtures'); exit;

    case 'fixture_update':
      if (!can('fixtures_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("UPDATE fixtures SET match_date=?, opponent=?, venue=?, home_away=?, competition=?, notes=? WHERE id=?");
      $stmt->execute([
        $_POST['match_date'], trim($_POST['opponent']), trim($_POST['venue']), $_POST['home_away'], trim($_POST['competition']), trim($_POST['notes']), (int)$_POST['id']
      ]);
      flash('Partido actualizado.');
      header('Location: ?page=fixtures'); exit;

    case 'fixture_delete':
      if (!can('fixtures_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("DELETE FROM fixtures WHERE id=?");
      $stmt->execute([(int)$_POST['id']]);
      flash('Partido eliminado.');
      header('Location: ?page=fixtures'); exit;

    // Merchandise
    case 'merchandise_create':
      if (!can('merchandise_manage')) throw new Exception('No autorizado');
      $img = save_upload('image_file','merchandise') ?? trim($_POST['image_url']);
      $stmt=$pdo->prepare("INSERT INTO merchandise(name,category,price,stock,description,image_url) VALUES(?,?,?,?,?,?)");
      $stmt->execute([
        trim($_POST['name']), trim($_POST['category']), (float)$_POST['price'], (int)$_POST['stock'], trim($_POST['description']), $img
      ]);
      flash('Producto agregado.');
      header('Location: ?page=merchandise'); exit;

    case 'merchandise_update':
      if (!can('merchandise_manage')) throw new Exception('No autorizado');
      $newImg = save_upload('image_file','merchandise');
      $imgUrl = $newImg ?? trim($_POST['image_url']);
      $stmt=$pdo->prepare("UPDATE merchandise SET name=?, category=?, price=?, stock=?, description=?, image_url=? WHERE id=?");
      $stmt->execute([
        trim($_POST['name']), trim($_POST['category']), (float)$_POST['price'], (int)$_POST['stock'], trim($_POST['description']), $imgUrl, (int)$_POST['id']
      ]);
      flash('Producto actualizado.');
      header('Location: ?page=merchandise'); exit;

    case 'merchandise_delete':
      if (!can('merchandise_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("DELETE FROM merchandise WHERE id=?");
      $stmt->execute([(int)$_POST['id']]);
      flash('Producto eliminado.');
      header('Location: ?page=merchandise'); exit;

    // Doctors
    case 'doctor_create':
      if (!can('doctors_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("INSERT INTO doctors(name,specialization,license_number,phone,email) VALUES(?,?,?,?,?)");
      $stmt->execute([
        trim($_POST['name']), trim($_POST['specialization']), trim($_POST['license_number']), trim($_POST['phone']), trim($_POST['email'])
      ]);
      flash('Médico agregado.');
      header('Location: ?page=medical'); exit;

    case 'doctor_update':
      if (!can('doctors_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("UPDATE doctors SET name=?, specialization=?, license_number=?, phone=?, email=? WHERE id=?");
      $stmt->execute([
        trim($_POST['name']), trim($_POST['specialization']), trim($_POST['license_number']), trim($_POST['phone']), trim($_POST['email']), (int)$_POST['id']
      ]);
      flash('Médico actualizado.');
      header('Location: ?page=medical'); exit;

    case 'doctor_delete':
      if (!can('doctors_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("DELETE FROM doctors WHERE id=?");
      $stmt->execute([(int)$_POST['id']]);
      flash('Médico eliminado.');
      header('Location: ?page=medical'); exit;

    // Medical Records
    case 'medical_record_create':
      if (!can('medical_records_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("INSERT INTO medical_records(patient_name,patient_number,doctor_name,diagnosis,treatment,prescription,visit_date,next_visit,notes) VALUES(?,?,?,?,?,?,?,?,?)");
      $stmt->execute([
        trim($_POST['patient_name']), trim($_POST['patient_number']), trim($_POST['doctor_name']), trim($_POST['diagnosis']), trim($_POST['treatment']), trim($_POST['prescription']), $_POST['visit_date'], $_POST['next_visit'] ?: null, trim($_POST['notes'])
      ]);
      flash('Registro médico agregado.');
      header('Location: ?page=medical'); exit;

    case 'medical_record_update':
      if (!can('medical_records_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("UPDATE medical_records SET patient_name=?, patient_number=?, doctor_name=?, diagnosis=?, treatment=?, prescription=?, visit_date=?, next_visit=?, notes=? WHERE id=?");
      $stmt->execute([
        trim($_POST['patient_name']), trim($_POST['patient_number']), trim($_POST['doctor_name']), trim($_POST['diagnosis']), trim($_POST['treatment']), trim($_POST['prescription']), $_POST['visit_date'], $_POST['next_visit'] ?: null, trim($_POST['notes']), (int)$_POST['id']
      ]);
      flash('Registro médico actualizado.');
      header('Location: ?page=medical'); exit;

    case 'medical_record_delete':
      if (!can('medical_records_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("DELETE FROM medical_records WHERE id=?");
      $stmt->execute([(int)$_POST['id']]);
      flash('Registro médico eliminado.');
      header('Location: ?page=medical'); exit;

    // Users
    case 'user_update':
      if (!can('users_manage')) throw new Exception('No autorizado');
      $stmt=$pdo->prepare("UPDATE users SET name=?, email=?, role=? WHERE id=?");
      $stmt->execute([trim($_POST['name']), trim($_POST['email']), $_POST['role'], (int)$_POST['id']]);
      if (!empty($_POST['user_number'])) {
        $stmt=$pdo->prepare("UPDATE users SET user_number=? WHERE id=?");
        $stmt->execute([trim($_POST['user_number']), (int)$_POST['id']]);
      }
      flash('Usuario actualizado.');
      header('Location: ?page=users'); exit;

    case 'user_delete':
      if (!can('users_manage')) throw new Exception('No autorizado');
      $id = (int)$_POST['id'];
      if ($id === ($_SESSION['user']['id'] ?? 0)) throw new Exception('No podés eliminar tu propia cuenta');
      $stmt = $pdo->prepare("SELECT role FROM users WHERE id=?");
      $stmt->execute([$id]);
      $roleToDelete = $stmt->fetchColumn();
      if (!$roleToDelete) throw new Exception('Usuario no encontrado');
      if ($roleToDelete === 'admin') {
        $adminsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn();
        if ($adminsCount <= 1) throw new Exception('No se puede eliminar el último admin');
      }
      $stmt = $pdo->prepare("DELETE FROM users WHERE id=?");
      $stmt->execute([$id]);
      flash('Usuario eliminado.');
      header('Location: ?page=users'); exit;

    // Export CSV
    case 'players_export':
      require_login();
      header('Content-Type: text/csv; charset=utf-8');
      header('Content-Disposition: attachment; filename=players_'.date('Ymd_His').'.csv');
      $out = fopen('php://output', 'w');
      fputcsv($out, ['ID','Nombre','Puesto','Goles','Asistencias','Tarjetas','Lesiones']);
      $stmt = $pdo->query("SELECT id,name,position,goals,assists,(yellow_cards+red_cards) as cards,injuries FROM players ORDER BY goals DESC, assists DESC");
      while($r=$stmt->fetch()) fputcsv($out, $r);
      fclose($out);
      exit;

    default: ;
  }
} catch (Throwable $e){
  flash($e->getMessage(),'error');
  header('Location: '.($_SERVER['HTTP_REFERER']??'?')); exit;
}
?>

