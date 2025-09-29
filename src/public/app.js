const state = {
  products: [],
  filtered: [],
  cart: [],
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

function formatCurrency(n) {
  try { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n); } catch { return `$${n}`; }
}

async function fetchProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  state.products = data;
  state.filtered = data;
  renderFeatured();
  renderCatalog();
}

function renderFeatured() {
  const featured = state.products.slice(0, 4);
  const grid = $('#featuredGrid');
  grid.innerHTML = featured.map(cardHtml).join('');
  bindCardButtons(grid);
}

function renderCatalog() {
  const grid = $('#catalogGrid');
  grid.innerHTML = state.filtered.map(cardHtml).join('');
  bindCardButtons(grid);
}

function cardHtml(p) {
  const img = p.imageUrl || 'https://picsum.photos/seed/' + encodeURIComponent(p.name) + '/600/400';
  return `
    <article class="card">
      <img src="${img}" alt="${p.name}" />
      <div class="card-body">
        <strong>${p.name}</strong>
        <span class="price">${formatCurrency(p.price)}</span>
        <button class="btn add-to-cart" data-id="${p.id}">Agregar</button>
      </div>
    </article>
  `;
}

function bindCardButtons(scope) {
  scope.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
}

function addToCart(id) {
  const product = state.products.find((p) => p.id === id);
  if (!product) return;
  const existing = state.cart.find((i) => i.id === id);
  if (existing) existing.qty += 1; else state.cart.push({ ...product, qty: 1 });
  renderCart();
}

function renderCart() {
  const items = $('#cartItems');
  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  items.innerHTML = state.cart
    .map((i) => `
      <div class="cart-item">
        <img src="${i.imageUrl || 'https://picsum.photos/seed/' + encodeURIComponent(i.name) + '/96/96'}" alt="${i.name}" />
        <div style="flex:1">
          <div><strong>${i.name}</strong></div>
          <div>${formatCurrency(i.price)} × ${i.qty}</div>
        </div>
        <button class="btn" data-id="${i.id}">-</button>
      </div>
    `)
    .join('');
  $('#cartTotal').textContent = formatCurrency(total);
  $('#cartIndicator').textContent = state.cart.reduce((s, i) => s + i.qty, 0);
  $('#cart').classList.add('open');
  items.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      const idx = state.cart.findIndex((i) => i.id === b.dataset.id);
      if (idx !== -1) {
        state.cart[idx].qty -= 1;
        if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
        renderCart();
      }
    });
  });
}

function bindFilters() {
  $('#searchInput').addEventListener('input', applyFilters);
  $('#categoryFilter').addEventListener('change', applyFilters);
  $('#sortSelect').addEventListener('change', applyFilters);
  $$('#categorias .cat').forEach((el) => el.addEventListener('click', () => {
    $('#categoryFilter').value = el.dataset.category;
    applyFilters();
    window.location.hash = '#catalogo';
  }));
}

function applyFilters() {
  const q = $('#searchInput').value.toLowerCase();
  const cat = $('#categoryFilter').value;
  const sort = $('#sortSelect').value;
  let list = [...state.products];
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  if (cat) list = list.filter((p) => p.category === cat);
  if (sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if (sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if (sort === 'name-asc') list.sort((a,b)=>a.name.localeCompare(b.name));
  if (sort === 'name-desc') list.sort((a,b)=>b.name.localeCompare(a.name));
  state.filtered = list;
  renderCatalog();
}

function bindCartUi() {
  $('#cartIndicator').addEventListener('click', () => $('#cart').classList.toggle('open'));
  $('#closeCart').addEventListener('click', () => $('#cart').classList.remove('open'));
  $('#checkoutBtn').addEventListener('click', () => alert('Gracias por su compra! (Demo)'));
}

function init() {
  $('#year').textContent = new Date().getFullYear();
  bindFilters();
  bindCartUi();
  fetchProducts();
}

document.addEventListener('DOMContentLoaded', init);
