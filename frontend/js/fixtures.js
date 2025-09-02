const bodyEl = document.getElementById('fixtureBody');
if (bodyEl) {
  fetch('/api/fixtures.php?scope=upcoming')
    .then(r=>r.json())
    .then((fixtures)=>{
      if(!fixtures||fixtures.length===0){ bodyEl.innerHTML = '<tr><td class="p-3 text-gray-500" colspan="6">Sin partidos.</td></tr>'; return; }
      bodyEl.innerHTML = fixtures.map(f=>`
        <tr class="border-b">
          <td class="p-3">${new Date(f.match_date).toLocaleDateString()}</td>
          <td class="p-3">${f.opponent}</td>
          <td class="p-3">${f.venue}</td>
          <td class="p-3">${f.home_away}</td>
          <td class="p-3">${f.competition||''}</td>
          <td class="p-3">${f.notes||''}</td>
        </tr>
      `).join('');
    })
    .catch(()=>{ bodyEl.innerHTML = '<tr><td class="p-3 text-red-600" colspan="6">Error al cargar.</td></tr>'; });
}

// Fixtures page interactions (placeholder)

