import { useEffect, useState } from 'react'
import api from '../lib/api'

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  sizes: string[]
  colors: string[]
  stock?: number
}

export function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState<Partial<Product>>({ name: '', price: 0, imageUrl: '', category: '', sizes: ['M'], colors: ['Negro'], stock: 100 })

  async function load() {
    const res = await api.get('/api/shop/products')
    setItems(res.data.items)
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    await api.post('/api/shop/admin/products', form)
    setForm({ name: '', price: 0, imageUrl: '', category: '', sizes: ['M'], colors: ['Negro'], stock: 100 })
    await load()
  }

  async function update(p: Product) {
    await api.put(`/api/shop/admin/products/${p.id}`, p)
    await load()
  }

  async function remove(id: string) {
    await api.delete(`/api/shop/admin/products/${id}`)
    await load()
  }

  return (
    <div>
      <h2>Admin Productos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Crear</h3>
          <input placeholder="Nombre" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Precio" type="number" value={form.price || 0} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value || '0') })} />
          <input placeholder="Imagen URL" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <input placeholder="Categoría" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input placeholder="Tallas (coma)" value={(form.sizes || []).join(',')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          <input placeholder="Colores (coma)" value={(form.colors || []).join(',')} onChange={(e) => setForm({ ...form, colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          <input placeholder="Stock" type="number" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || '0', 10) })} />
          <button onClick={create}>Crear producto</button>
        </div>
        <div>
          <h3>Lista</h3>
          {items.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', gap: 12 }}>
                <img src={p.imageUrl} alt={p.name} style={{ width: 120, height: 80, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <input value={p.name} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))} />
                  <input type="number" value={p.price} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, price: parseFloat(e.target.value || '0') } : x)))} />
                  <input value={p.category} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, category: e.target.value } : x)))} />
                  <input value={(p.sizes || []).join(',')} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } : x)))} />
                  <input value={(p.colors || []).join(',')} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } : x)))} />
                  <input type="number" value={p.stock || 0} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: parseInt(e.target.value || '0', 10) } : x)))} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => update(p)}>Guardar</button>
                <button onClick={() => remove(p.id)} style={{ marginLeft: 8 }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

