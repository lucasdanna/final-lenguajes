import { useMemo, useState } from 'react'
import { useCart } from './cart'
import { Link } from 'react-router-dom'
import { useProducts } from './products'

export function CatalogPage() {
  const { add } = useCart()
  const { products, loading } = useProducts()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'name' | 'price'>('name')

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()))
    if (category) list = list.filter((p) => p.category === category)
    if (sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'price') list = list.slice().sort((a, b) => a.price - b.price)
    return list
  }, [q, category, sort])

  if (loading) return <p>Cargando productos...</p>

  return (
    <div>
      <h2>Tienda</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
        </select>
      </div>

      <div className="grid">
        {filtered.map((p) => (
          <div key={p.id} className="card">
            <Link to={`/shop/product/${p.id}`}>
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <h3>{p.name}</h3>
            </Link>
            <p>{p.category}</p>
            <strong>€ {p.price.toFixed(2)}</strong>
            <button onClick={() => add({ productId: p.id, quantity: 1, size: p.sizes[0], color: p.colors[0] })}>Añadir al carrito</button>
          </div>
        ))}
      </div>
    </div>
  )
}

