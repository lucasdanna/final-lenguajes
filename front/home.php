<?php
require_once dirname(__DIR__).'/backend/helpers.php';
require_once dirname(__DIR__).'/db/connection.php';
$pdo = db();

$news = $pdo->query("SELECT * FROM news ORDER BY published_at DESC LIMIT 6")->fetchAll();
$fixtures = $pdo->query("SELECT * FROM fixtures WHERE match_date>=CURDATE() ORDER BY match_date ASC LIMIT 6")->fetchAll();
$top_scorers = $pdo->query("
  SELECT id,name,position,player_number,goals,assists,image_url,nationality
  FROM players
  ORDER BY goals DESC, assists DESC, name ASC
  LIMIT 5
")->fetchAll();
$recent_results = $pdo->query("
  SELECT * FROM fixtures WHERE match_date<CURDATE() ORDER BY match_date DESC LIMIT 6
")->fetchAll();
$merch_latest = $pdo->query("SELECT * FROM merchandise ORDER BY created_at DESC LIMIT 6")->fetchAll();
$overview = [
  'players' => (int)$pdo->query("SELECT COUNT(*) c FROM players")->fetch()['c'],
  'goals' => (int)$pdo->query("SELECT COALESCE(SUM(goals),0) s FROM players")->fetch()['s'],
  'assists' => (int)$pdo->query("SELECT COALESCE(SUM(assists),0) s FROM players")->fetch()['s'],
  'news' => (int)$pdo->query("SELECT COUNT(*) c FROM news")->fetch()['c'],
  'fixtures' => (int)$pdo->query("SELECT COUNT(*) c FROM fixtures")->fetch()['c'],
  'doctors' => (int)$pdo->query("SELECT COUNT(*) c FROM doctors")->fetch()['c'],
  'medical_recent' => (int)$pdo->query("SELECT COUNT(*) c FROM medical_records WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)")->fetch()['c'],
];
?>

<section class="mb-8">
  <h2 class="text-3xl font-bold text-gray-800 mb-4">📊 Resumen del Club</h2>
  <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
    <div class="bg-white rounded-2xl shadow p-4"><div class="text-sm text-gray-500">Jugadores</div><div class="text-2xl font-bold"><?= $overview['players'] ?></div></div>
    <div class="bg-white rounded-2xl shadow p-4"><div class="text-sm text-gray-500">Goles</div><div class="text-2xl font-bold"><?= $overview['goals'] ?></div></div>
    <div class="bg-white rounded-2xl shadow p-4"><div class="text-sm text-gray-500">Asistencias</div><div class="text-2xl font-bold"><?= $overview['assists'] ?></div></div>
    <div class="bg-white rounded-2xl shadow p-4"><div class="text-sm text-gray-500">Noticias</div><div class="text-2xl font-bold"><?= $overview['news'] ?></div></div>
    <div class="bg-white rounded-2xl shadow p-4"><div class="text-sm text-gray-500">Partidos</div><div class="text-2xl font-bold"><?= $overview['fixtures'] ?></div></div>
    <div class="bg-white rounded-2xl shadow p-4"><div class="text-sm text-gray-500">Visitas méd. (30d)</div><div class="text-2xl font-bold"><?= $overview['medical_recent'] ?></div></div>
  </div>
</section>

<section class="mb-10">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold text-gray-800">📰 Últimas Noticias</h2>
    <a href="?page=news" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Ver todas las noticias</a>
  </div>
  <div class="grid md:grid-cols-3 gap-6">
    <?php if(!$news): ?>
      <div class="col-span-3 text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📰</div>
        <p class="text-gray-500 text-lg">No hay noticias aún.</p>
      </div>
    <?php endif; ?>
    <?php foreach($news as $n): ?>
      <article class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <img class="w-full h-48 object-cover" loading="lazy" src="<?=h(asset_image($n['image_url'], 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&h=400&fit=crop'))?>" alt="Noticia">
        <div class="p-6">
          <h3 class="font-bold text-xl mb-3 text-gray-800"><?=h($n['title'])?></h3>
          <p class="text-gray-600 mb-4 line-clamp-3"><?=nl2br(h(mb_strimwidth($n['body'],0,150,'…')))?></p>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500"><?=date('d/m/Y H:i',strtotime($n['published_at']))?></div>
            <a href="?page=news&view=<?=$n['id']?>" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">📖 Leer más</a>
          </div>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</section>

<section class="mb-10">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold text-gray-800">⚽ Próximos Partidos</h2>
    <a href="?page=fixtures" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Ver fixture completo</a>
  </div>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <tr>
            <th class="p-4 font-semibold">📅 Fecha</th>
            <th class="p-4 font-semibold">🆚 Rival</th>
            <th class="p-4 font-semibold">📍 Lugar</th>
            <th class="p-4 font-semibold">🏠 Condición</th>
            <th class="p-4 font-semibold">🏆 Competición</th>
            <th class="p-4 font-semibold">📝 Notas</th>
          </tr>
        </thead>
        <tbody>
          <?php if(!$fixtures): ?>
            <tr>
              <td class="p-8 text-center text-gray-500" colspan="6">
                <div class="text-gray-400 text-4xl mb-2">⚽</div>
                <p class="text-lg">No hay partidos próximos.</p>
              </td>
            </tr>
          <?php endif; ?>
          <?php foreach($fixtures as $f): ?>
            <tr class="border-b hover:bg-gray-50 transition-colors">
              <td class="p-4 font-medium"><?=date('d/m/Y',strtotime($f['match_date']))?></td>
              <td class="p-4 font-semibold text-gray-800"><?=h($f['opponent'])?></td>
              <td class="p-4"><?=h($f['venue'])?></td>
              <td class="p-4"><span class="px-3 py-1 rounded-full text-xs font-medium <?= $f['home_away']==='Local'?'bg-green-100 text-green-800':'bg-blue-100 text-blue-800' ?>"><?=h($f['home_away'])?></span></td>
              <td class="p-4"><?=h($f['competition'])?></td>
              <td class="p-4 text-sm text-gray-600"><?=h($f['notes'])?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="mb-10 grid md:grid-cols-2 gap-6">
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-2xl font-bold text-gray-800">🥇 Máximos Goleadores</h3>
      <a href="?page=players" class="text-blue-600 hover:text-blue-800 text-sm">Ver jugadores</a>
    </div>
    <?php if(!$top_scorers): ?>
      <p class="text-gray-500">No hay jugadores con goles registrados.</p>
    <?php else: ?>
      <div class="space-y-3">
        <?php foreach($top_scorers as $i => $pl): ?>
          <div class="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
            <div class="flex items-center">
              <img class="w-10 h-10 rounded-full mr-3 object-cover" loading="lazy" src="<?=h(asset_image($pl['image_url'], 'https://ui-avatars.com/api/?name='.urlencode($pl['name']).'&background=0D8ABC&color=fff'))?>" alt="<?=h($pl['name'])?>">
              <div>
                <div class="font-semibold text-gray-800"><?=h($pl['name'])?> <?= $pl['player_number'] ? '#'.$pl['player_number'] : '' ?></div>
                <div class="text-xs text-gray-500"><?=h($pl['position'])?><?= $pl['nationality'] ? ' • '.h($pl['nationality']) : '' ?></div>
              </div>
            </div>
            <div class="text-right"><div class="font-bold text-green-600"><?=$pl['goals']?> G</div><div class="text-xs text-gray-500"><?=$pl['assists']?> A</div></div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-2xl font-bold text-gray-800">🛍️ Novedades de la Tienda</h3>
      <a href="?page=merchandise" class="text-blue-600 hover:text-blue-800 text-sm">Ver tienda</a>
    </div>
    <?php if(!$merch_latest): ?>
      <p class="text-gray-500">Sin productos disponibles.</p>
    <?php else: ?>
      <div class="grid sm:grid-cols-2 gap-4">
        <?php foreach($merch_latest as $m): ?>
          <div class="border rounded-xl p-3 hover:shadow transition">
            <img class="w-full h-28 object-cover rounded mb-2" loading="lazy" src="<?=h(asset_image($m['image_url'], 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=300&fit=crop'))?>" alt="Producto">
            <div class="font-semibold"><?=h($m['name'])?></div>
            <div class="text-xs text-gray-500 mb-1"><?=h($m['category'])?></div>
            <div class="text-green-600 font-bold">$<?=number_format($m['price'],2)?></div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

