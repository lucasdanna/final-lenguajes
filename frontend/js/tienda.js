const storeGrid = document.getElementById('storeGrid');
const storeSearch = document.getElementById('storeSearch');
let merchCache = [];

function renderStore(items){
  if (!items || items.length===0){ storeGrid.innerHTML = '<p class="text-gray-500">Sin productos.</p>'; return; }
  storeGrid.innerHTML = items.map(m=>`
    <div class="bg-white rounded-2xl shadow p-4">
      <img class="w-full h-40 object-cover rounded-xl mb-3" src="${m.image_url||'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=400&fit=crop'}" alt="Producto">
      <h3 class="font-bold text-lg mb-2">${m.name}</h3>
      <div class="text-gray-600 mb-2">
        <div class="text-sm text-gray-500">${m.category}</div>
        <div class="text-xl font-bold text-green-600">$${Number(m.price).toFixed(2)}</div>
      </div>
      <button class="bg-blue-600 text-white rounded px-3 py-2">Añadir</button>
    </div>
  `).join('');
}

if (storeGrid) {
  fetch('/api/merchandise.php')
    .then(r=>r.json())
    .then(rows => { merchCache = rows||[]; renderStore(merchCache); })
    .catch(()=>{ storeGrid.innerHTML = '<p class="text-red-600">No se pudo cargar la tienda.</p>'; });
}

if (storeSearch) {
  storeSearch.addEventListener('input', (e)=>{
    const q = (e.target.value||'').toLowerCase();
    const filtered = merchCache.filter(m =>
      (m.name||'').toLowerCase().includes(q) ||
      (m.category||'').toLowerCase().includes(q)
    );
    renderStore(filtered);
  });
}

// Tienda page interactions (placeholder)

