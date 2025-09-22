import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useCart } from '../shop/cart'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { totalItems } = useCart()

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/">Inicio</Link>
        <Link to="/shop">Tienda</Link>
        <Link to="/shop/cart">Carrito ({totalItems})</Link>
        <div style={{ marginLeft: 'auto' }}>
          {user ? (
            <>
              <span style={{ marginRight: 8 }}>Hola, {user.name}</span>
              <button onClick={() => { logout(); navigate('/login') }}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <span> · </span>
              <Link to="/register">Registro</Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

