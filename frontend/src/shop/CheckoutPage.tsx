import { useCart } from './cart'

export function CheckoutPage() {
  const { totalPrice, clear } = useCart()

  function pay() {
    // Simulación de pago
    alert(`Pago realizado por € ${totalPrice.toFixed(2)}. ¡Gracias!`)
    clear()
  }

  return (
    <div>
      <h2>Checkout</h2>
      <p>Introduzca sus datos (simulado):</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Nombre" />
        <input placeholder="Dirección" />
        <input placeholder="Tarjeta (simulado)" />
        <button onClick={pay}>Pagar € {totalPrice.toFixed(2)}</button>
      </div>
    </div>
  )
}

