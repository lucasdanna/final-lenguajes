import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/">Inicio</Link>
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

