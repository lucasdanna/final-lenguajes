import { useCart } from './cart'
import { Link } from 'react-router-dom'

export function CartPage() {
  const { itemsDetailed, totalItems, totalPrice, updateQty, remove, clear } = useCart()

  if (itemsDetailed.length === 0) {
    return (
      <div>
        <h2>Carrito</h2>
        <p>Tu carrito está vacío.</p>
        <Link to="/shop">Ir a la tienda</Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Carrito ({totalItems})</h2>
      <div>
        {itemsDetailed.map((item) => (
          <div key={`${item.productId}|${item.size}|${item.color}`} className="cart-row">
            <img src={item.product.imageUrl} alt={item.product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <strong>{item.product.name}</strong>
              <div>{item.size} · {item.color}</div>
            </div>
            <div>€ {item.product.price.toFixed(2)}</div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQty(item.productId, parseInt(e.target.value || '1', 10), { size: item.size, color: item.color })}
              style={{ width: 80, margin: '0 8px' }}
            />
            <button onClick={() => remove(item.productId, { size: item.size, color: item.color })}>Eliminar</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button onClick={clear}>Vaciar carrito</button>
        <div>
          <strong>Total: € {totalPrice.toFixed(2)}</strong>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Link to="/shop/checkout"><button>Proceder al pago</button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

