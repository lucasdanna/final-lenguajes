fetch('/api/news.php?limit=60')
  .then(r=>r.json())
  .then((news) => {
    const el = document.getElementById('newsContainer');
    if(!news || news.length===0){ el.innerHTML='<p class="text-gray-500">No hay noticias.</p>'; return; }
    el.innerHTML = news.map(n => `
      <article class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <img class="w-full h-48 object-cover" src="${n.image_url||'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&h=400&fit=crop'}" alt="Noticia">
        <div class="p-6">
          <h3 class="font-bold text-xl mb-3 text-gray-800">${n.title}</h3>
          <div class="text-sm text-gray-500 mb-3">${new Date(n.published_at).toLocaleString()}</div>
          <p class="text-gray-600 mb-4">${(n.body||'').slice(0,200)}${(n.body||'').length>200?'…':''}</p>
        </div>
      </article>
    `).join('');
  })
  .catch(()=>{
    const el = document.getElementById('newsContainer');
    if (el) el.innerHTML = '<p class="text-red-600">No se pudieron cargar las noticias.</p>';
  });

// Noticias page interactions (placeholder)

