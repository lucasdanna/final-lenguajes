import { useCart } from './cart'
import api from '../lib/api'
import { loadStripe } from '@stripe/stripe-js'

export function CheckoutPage() {
  const { totalPrice, clear } = useCart()

  async function pay() {
    const customer = { name: (document.querySelector('#name') as HTMLInputElement)?.value || '' }
    const items = itemsDetailed.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color, price: i.product.price }))
    const total = totalPrice
    // If Stripe configured, redirect to Stripe checkout
    try {
      const stripeRes = await api.post('/api/shop/checkout/stripe', { items: itemsDetailed.map((i) => ({ name: i.product.name, price: i.product.price, quantity: i.quantity })), successUrl: window.location.origin + '/shop', cancelUrl: window.location.origin + '/shop/cart' })
      if (stripeRes.data?.url) {
        window.location.href = stripeRes.data.url
        return
      }
    } catch {}
    // Fallback: simple order creation
    const res = await api.post('/api/shop/orders', { customer, items, total })
    alert(`Pedido #${res.data.number} creado. ¡Gracias!`)
    clear()
  }

  return (
    <div>
      <h2>Checkout</h2>
      <p>Introduzca sus datos (simulado):</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input id="name" placeholder="Nombre" />
        <input placeholder="Dirección" />
        <input placeholder="Tarjeta (simulado)" />
        <button onClick={pay}>Pagar € {totalPrice.toFixed(2)}</button>
      </div>
    </div>
  )
}

