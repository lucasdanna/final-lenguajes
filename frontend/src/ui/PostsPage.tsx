import { FormEvent, useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'

type Post = { _id: string; title: string; content: string; authorId: string }

export function PostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function fetchPosts() {
    const res = await api.get('/api/posts?limit=50')
    setPosts(res.data.items)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    await api.post('/api/posts', { title, content })
    setTitle('')
    setContent('')
    await fetchPosts()
  }

  async function onDelete(id: string) {
    await api.delete(`/api/posts/${id}`)
    await fetchPosts()
  }

  return (
    <div>
      <h2>Publicaciones</h2>
      {user && (
        <form onSubmit={onCreate} style={{ marginBottom: 16 }}>
          <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Contenido" value={content} onChange={(e) => setContent(e.target.value)} />
          <button type="submit">Crear</button>
        </form>
      )}
      <ul>
        {posts.map((p) => (
          <li key={p._id}>
            <Link to={`/posts/${p._id}`}>{p.title}</Link>
            {user?.id === p.authorId && (
              <>
                {' '}
                <button onClick={() => onDelete(p._id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

