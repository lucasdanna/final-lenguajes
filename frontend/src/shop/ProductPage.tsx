import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from './cart'
import { useProducts } from './products'

export function ProductPage() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const product = useMemo(() => products.find((p) => p.id === id), [id, products])
  const { add } = useCart()
  const [size, setSize] = useState(product?.sizes[0])
  const [color, setColor] = useState(product?.colors[0])
  const [qty, setQty] = useState(1)

  if (loading) return <p>Cargando...</p>
  if (!product) return <p>Producto no encontrado</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', borderRadius: 8 }} />
      <div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <strong>€ {product.price.toFixed(2)}</strong>
        <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {product.sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            {product.colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || '1', 10))} style={{ width: 80 }} />
        </div>
        <button onClick={() => add({ productId: product.id, quantity: qty, size, color })}>Añadir al carrito</button>
      </div>
    </div>
  )
}

