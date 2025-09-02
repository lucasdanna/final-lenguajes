<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
require_once dirname(__DIR__).'/backend/actions.php';

$page = $_GET['page'] ?? 'home';
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Club Manager</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  <style>.line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}</style>
  </head>
<body class="bg-gray-100 min-h-screen">
  <header class="bg-gray-900 text-white shadow">
    <nav class="container mx-auto p-4">
      <div class="flex items-center justify-between">
        <a href="?"><h1 class="text-2xl font-bold">⚽ Club Manager</h1></a>
        <div class="hidden md:flex items-center gap-4">
          <div class="relative">
            <button id="navMenuButton" class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md"><span>Menú</span><svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.173l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg></button>
            <div id="navMenuDropdown" class="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-lg shadow-lg hidden z-50 py-2">
              <a href="?" class="block px-4 py-2 hover:bg-gray-100">Inicio</a>
              <a href="?page=dashboard" class="block px-4 py-2 hover:bg-gray-100">Dashboard</a>
              <div class="border-t my-2"></div>
              <a href="?page=players" class="block px-4 py-2 hover:bg-gray-100">Jugadores</a>
              <a href="?page=fixtures" class="block px-4 py-2 hover:bg-gray-100">Fixture</a>
              <?php if(can('team_management')): ?><a href="?page=team" class="block px-4 py-2 hover:bg-gray-100">Gestión de Equipo</a><?php endif; ?>
              <div class="border-t my-2"></div>
              <a href="?page=merchandise" class="block px-4 py-2 hover:bg-gray-100">Merchandising</a>
              <a href="?page=medical" class="block px-4 py-2 hover:bg-gray-100">Enfermería</a>
              <a href="?page=news" class="block px-4 py-2 hover:bg-gray-100">Noticias</a>
              <?php if(can('users_manage')): ?><div class="border-t my-2"></div><a href="?page=users" class="block px-4 py-2 hover:bg-gray-100">Usuarios</a><?php endif; ?>
            </div>
          </div>
          <?php if(role()!=='guest'): ?>
            <form method="post">
              <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
              <input type="hidden" name="action" value="logout">
              <button class="bg-yellow-400 text-black px-3 py-2 rounded hover:bg-yellow-500">Salir (<?=h($_SESSION['user']['name'])?>)</button>
            </form>
          <?php else: ?>
            <a class="bg-yellow-400 text-black px-3 py-2 rounded hover:bg-yellow-500" href="?page=login">Login</a>
          <?php endif; ?>
        </div>
        <button id="mobileMenuButton" class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400" aria-expanded="false" aria-controls="mobileMenuPanel">
          <svg id="mobileMenuIconOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg id="mobileMenuIconClose" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div id="mobileMenuPanel" class="md:hidden hidden bg-gray-800 mt-3 rounded-lg">
        <div class="p-3 space-y-1">
          <a href="?" class="block px-3 py-2 rounded hover:bg-gray-700">Inicio</a>
          <a href="?page=dashboard" class="block px-3 py-2 rounded hover:bg-gray-700">Dashboard</a>
          <div class="border-t border-gray-700 my-2"></div>
          <a href="?page=players" class="block px-3 py-2 rounded hover:bg-gray-700">Jugadores</a>
          <a href="?page=fixtures" class="block px-3 py-2 rounded hover:bg-gray-700">Fixture</a>
          <?php if(can('team_management')): ?><a href="?page=team" class="block px-3 py-2 rounded hover:bg-gray-700">Gestión de Equipo</a><?php endif; ?>
          <div class="border-t border-gray-700 my-2"></div>
          <a href="?page=merchandise" class="block px-3 py-2 rounded hover:bg-gray-700">Merchandising</a>
          <a href="?page=medical" class="block px-3 py-2 rounded hover:bg-gray-700">Enfermería</a>
          <a href="?page=news" class="block px-3 py-2 rounded hover:bg-gray-700">Noticias</a>
          <?php if(can('users_manage')): ?><div class="border-t border-gray-700 my-2"></div><a href="?page=users" class="block px-3 py-2 rounded hover:bg-gray-700">Usuarios</a><?php endif; ?>
          <div class="border-t border-gray-700 my-2"></div>
          <?php if(role()!=='guest'): ?>
          <form method="post" class="px-1">
            <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
            <input type="hidden" name="action" value="logout">
            <button class="w-full bg-yellow-400 text-black px-3 py-2 rounded hover:bg-yellow-500">Salir (<?=h($_SESSION['user']['name'])?>)</button>
          </form>
          <?php else: ?>
          <a class="block bg-yellow-400 text-black px-3 py-2 rounded hover:bg-yellow-500" href="?page=login">Login</a>
          <?php endif; ?>
        </div>
      </div>
    </nav>
  </header>

  <div id="toastContainer" class="fixed top-4 right-4 z-50 space-y-2">
    <?php foreach(flash() as $f): ?>
      <div class="px-4 py-3 rounded-lg shadow-lg text-white flex items-start gap-3 <?= $f['t']==='error'?'bg-red-600':'bg-green-600' ?> toast-item">
        <div class="text-xl"><?= $f['t']==='error'?'⚠️':'✅' ?></div>
        <div class="font-medium"><?=h($f['m'])?></div>
        <button class="ml-3 text-white/80 hover:text-white" onclick="this.parentElement.remove()">✕</button>
      </div>
    <?php endforeach; ?>
  </div>

  <main class="container mx-auto p-4">
    <?php
      $viewPath = null;
      switch ($page) {
        case 'home':
          $viewPath = dirname(__DIR__).'/front/home.php';
          break;
        default:
          $viewPath = null; // fallback inline
      }
      if ($viewPath && file_exists($viewPath)) {
        include $viewPath;
      } else {
        echo '<div class="bg-white rounded-2xl shadow p-6"><h2 class="text-2xl font-bold mb-2">Página no encontrada</h2><p class="text-gray-600">La página solicitada no existe.</p></div>';
      }
    ?>
  </main>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const navBtn = document.getElementById('navMenuButton');
      const navDrop = document.getElementById('navMenuDropdown');
      if (navBtn && navDrop) {
        navBtn.addEventListener('click', (e) => { e.stopPropagation(); navDrop.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!navDrop.classList.contains('hidden') && !navDrop.contains(e.target) && e.target !== navBtn) { navDrop.classList.add('hidden'); } });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') navDrop.classList.add('hidden'); });
      }
      const mobileBtn = document.getElementById('mobileMenuButton');
      const mobilePanel = document.getElementById('mobileMenuPanel');
      const iconOpen = document.getElementById('mobileMenuIconOpen');
      const iconClose = document.getElementById('mobileMenuIconClose');
      if (mobileBtn && mobilePanel) {
        mobileBtn.addEventListener('click', () => {
          const isHidden = mobilePanel.classList.contains('hidden');
          mobilePanel.classList.toggle('hidden', !isHidden);
          mobileBtn.setAttribute('aria-expanded', String(isHidden));
          if (iconOpen && iconClose) { iconOpen.classList.toggle('hidden', !isHidden); iconClose.classList.toggle('hidden', isHidden); }
        });
        document.addEventListener('click', (e) => {
          if (!mobilePanel.classList.contains('hidden')) {
            const clickInside = mobilePanel.contains(e.target) || mobileBtn.contains(e.target);
            if (!clickInside) {
              mobilePanel.classList.add('hidden');
              mobileBtn.setAttribute('aria-expanded', 'false');
              if (iconOpen && iconClose) { iconOpen.classList.remove('hidden'); iconClose.classList.add('hidden'); }
            }
          }
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !mobilePanel.classList.contains('hidden')) {
            mobilePanel.classList.add('hidden');
            mobileBtn.setAttribute('aria-expanded', 'false');
            if (iconOpen && iconClose) { iconOpen.classList.remove('hidden'); iconClose.classList.add('hidden'); }
          }
        });
      }
      document.querySelectorAll('.toast-item').forEach((el) => { setTimeout(() => { el.remove(); }, 4000); });
    });
  </script>
</body>
</html>

