<?php
require_once dirname(__DIR__).'/backend/helpers.php';

// =========== CONFIG DB ===========
const DB_HOST = '127.0.0.1';
const DB_NAME = 'club_manager';
const DB_USER = 'root';
const DB_PASS = '';
const DB_CHARSET = 'utf8mb4';
// =================================

// ---- Conexión PDO ----
function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $dsn = 'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset='.DB_CHARSET;
  try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } catch (PDOException $e) {
    if (str_contains($e->getMessage(), 'Unknown database')) {
      $tmp = new PDO('mysql:host='.DB_HOST.';charset='.DB_CHARSET, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      ]);
      $tmp->exec('CREATE DATABASE `'.DB_NAME.'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      $tmp = null;
      return db();
    }
    die('DB error: '.$e->getMessage());
  }
  return $pdo;
}

// ---- Migraciones mínimas ----
function migrate(){
  $pdo = db();
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS users(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin','entrenador','jugador') NOT NULL DEFAULT 'jugador',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS players(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      position ENUM('Arquero','Defensa','Mediocampista','Delantero') NOT NULL,
      player_number INT NULL,
      goals INT NOT NULL DEFAULT 0,
      assists INT NOT NULL DEFAULT 0,
      yellow_cards INT NOT NULL DEFAULT 0,
      red_cards INT NOT NULL DEFAULT 0,
      injuries VARCHAR(255) NULL,
      image_url VARCHAR(255) NULL,
      height DECIMAL(4,2) NULL,
      weight DECIMAL(5,2) NULL,
      birth_date DATE NULL,
      nationality VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");

  // Additive alters (ignore errors if exist)
  foreach ([
    "ALTER TABLE players ADD COLUMN player_number INT NULL AFTER position",
    "ALTER TABLE players ADD COLUMN yellow_cards INT NOT NULL DEFAULT 0 AFTER assists",
    "ALTER TABLE players ADD COLUMN red_cards INT NOT NULL DEFAULT 0 AFTER yellow_cards",
    "ALTER TABLE players ADD COLUMN image_url VARCHAR(255) NULL AFTER injuries",
    "ALTER TABLE players ADD COLUMN height DECIMAL(4,2) NULL AFTER image_url",
    "ALTER TABLE players ADD COLUMN weight DECIMAL(5,2) NULL AFTER height",
    "ALTER TABLE players ADD COLUMN birth_date DATE NULL AFTER weight",
    "ALTER TABLE players ADD COLUMN nationality VARCHAR(100) NULL AFTER birth_date",
  ] as $sql){
    try { $pdo->exec($sql); } catch (PDOException $e) {}
  }

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS news(
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      body TEXT NOT NULL,
      image_url VARCHAR(255) NULL,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS fixtures(
      id INT AUTO_INCREMENT PRIMARY KEY,
      match_date DATE NOT NULL,
      opponent VARCHAR(160) NOT NULL,
      venue VARCHAR(160) NOT NULL,
      home_away ENUM('Local','Visitante') NOT NULL DEFAULT 'Local',
      competition VARCHAR(120) NULL,
      notes VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS merchandise(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      description TEXT NULL,
      image_url VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS medical_records(
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_name VARCHAR(160) NOT NULL,
      patient_number VARCHAR(20) NOT NULL,
      doctor_name VARCHAR(160) NOT NULL,
      diagnosis TEXT NOT NULL,
      treatment TEXT NULL,
      prescription TEXT NULL,
      visit_date DATE NOT NULL,
      next_visit DATE NULL,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS doctors(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      specialization VARCHAR(160) NOT NULL,
      license_number VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NULL,
      email VARCHAR(190) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  ");

  try {
    $pdo->exec("ALTER TABLE users ADD COLUMN user_number VARCHAR(20) NULL AFTER role");
  } catch (PDOException $e) {}

  $has = $pdo->query("SELECT COUNT(*) c FROM users")->fetch()['c'] ?? 0;
  if (!$has) {
    $stmt = $pdo->prepare("INSERT INTO users(name,email,password_hash,role,user_number) VALUES(?,?,?,?,?)");
    $stmt->execute(['Admin', 'admin@club.test', password_hash('admin123', PASSWORD_DEFAULT), 'admin', 'ADM001']);
  }
}

// Run migrations on load
migrate();
?>

