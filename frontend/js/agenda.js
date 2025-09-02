const eventsEl = document.getElementById('eventsContainer');
const eventsCount = document.getElementById('eventsCount');
if (eventsEl) {
  fetch('/api/events.php')
    .then(r=>r.json())
    .then(events => {
      eventsCount && (eventsCount.textContent = `${events.length} evento(s)`);
      if (!events || events.length===0) {
        eventsEl.innerHTML = '<p class="text-gray-500">No hay eventos próximos.</p>';
        return;
      }
      const typeBadge = (t) => {
        const base = 'px-2 py-1 rounded-full text-xs font-medium ';
        if (t==='entrenamiento') return base+'bg-emerald-100 text-emerald-800';
        if (t==='reunion') return base+'bg-indigo-100 text-indigo-800';
        return base+'bg-blue-100 text-blue-800';
      };
      eventsEl.innerHTML = events.map(ev => {
        const start = new Date(ev.start_datetime);
        const end = ev.end_datetime ? new Date(ev.end_datetime) : null;
        return `
          <div class="border rounded p-4 bg-white flex items-start justify-between">
            <div>
              <div class="font-semibold text-gray-800">${ev.title}</div>
              <div class="text-sm text-gray-600">${start.toLocaleString()}${end?' - '+end.toLocaleString():''}</div>
              <div class="text-xs text-gray-500">${ev.location||''}</div>
              ${ev.notes?`<div class=\"text-xs text-gray-500 mt-1\">${ev.notes}</div>`:''}
            </div>
            <span class="${typeBadge(ev.type)}">${ev.type}</span>
          </div>
        `;
      }).join('');
    })
    .catch(()=>{
      eventsEl.innerHTML = '<p class="text-red-600">No se pudo cargar la agenda.</p>';
    });
}

// Agenda page interactions (placeholder)

