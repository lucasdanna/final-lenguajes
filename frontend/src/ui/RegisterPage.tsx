import { FormEvent, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al registrarse')
    }
  }

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Crear cuenta</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}

