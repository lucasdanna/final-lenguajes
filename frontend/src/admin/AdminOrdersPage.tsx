import { useEffect, useState } from 'react'
import api from '../lib/api'

type Order = {
  _id: string
  number: number
  customer: any
  items: any[]
  total: number
  status?: string
  createdAt: number
}

export function AdminOrdersPage() {
  const [items, setItems] = useState<Order[]>([])

  async function load() {
    const res = await api.get('/api/shop/admin/orders')
    setItems(res.data.items)
  }

  useEffect(() => {
    load()
  }, [])

  async function setStatus(o: Order, status: string) {
    await api.put(`/api/shop/admin/orders/${o._id}`, { status })
    await load()
  }

  return (
    <div>
      <h2>Admin Pedidos</h2>
      {items.map((o) => (
        <div key={o._id} className="card">
          <div><strong>#{o.number}</strong> · € {o.total.toFixed(2)} · {new Date(o.createdAt).toLocaleString()} · {o.status || 'pendiente'}</div>
          <div>Cliente: {o.customer?.name || 'N/A'}</div>
          <ul>
            {o.items.map((i, idx) => (
              <li key={idx}>{i.quantity} x {i.productId} {i.size} {i.color} (€ {i.price?.toFixed?.(2)})</li>
            ))}
          </ul>
          <div>
            <button onClick={() => setStatus(o, 'pagado')}>Marcar pagado</button>
            <button onClick={() => setStatus(o, 'enviado')} style={{ marginLeft: 8 }}>Marcar enviado</button>
          </div>
        </div>
      ))}
    </div>
  )
}

