const grid = document.getElementById('playersGrid');
if (grid) {
  fetch('/api/players.php')
    .then(r=>r.json())
    .then(players => {
      if (!players || players.length===0) { grid.innerHTML = '<p class="text-gray-500">No hay jugadores.</p>'; return; }
      grid.innerHTML = players.map(pl => `
        <div class="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
          <img class="w-full h-44 object-cover" src="${pl.image_url||('https://ui-avatars.com/api/?name='+encodeURIComponent(pl.name)+'&background=0D8ABC&color=fff')}" alt="${pl.name}">
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-lg text-gray-800">${pl.name}</div>
              <span class="px-2 py-1 rounded-full text-xs font-medium ${
                pl.position==='Arquero'?'bg-yellow-100 text-yellow-800':
                (pl.position==='Defensa'?'bg-blue-100 text-blue-800':
                (pl.position==='Mediocampista'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'))
              }">${pl.position}</span>
            </div>
            <div class="grid grid-cols-4 gap-2 text-center text-sm">
              <div class="bg-green-50 rounded p-2"><div class="font-bold text-green-600">${pl.goals}</div><div class="text-xs text-gray-600">Goles</div></div>
              <div class="bg-blue-50 rounded p-2"><div class="font-bold text-blue-600">${pl.assists}</div><div class="text-xs text-gray-600">Asistencias</div></div>
              <div class="bg-yellow-50 rounded p-2"><div class="font-bold text-yellow-600">${pl.yellow_cards||0}</div><div class="text-xs text-gray-600">Amar</div></div>
              <div class="bg-red-50 rounded p-2"><div class="font-bold text-red-600">${pl.red_cards||0}</div><div class="text-xs text-gray-600">Rojas</div></div>
            </div>
            ${pl.injuries?`<div class=\"mt-2 text-xs text-red-600\">🏥 ${pl.injuries}</div>`:''}
          </div>
        </div>
      `).join('');
    })
    .catch(()=>{ grid.innerHTML = '<p class="text-red-600">No se pudieron cargar los jugadores.</p>'; });
}

// Jugadores page interactions (placeholder)

