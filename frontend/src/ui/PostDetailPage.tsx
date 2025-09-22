import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { io } from 'socket.io-client'

type Comment = { _id: string; content: string; authorId: string; postId: string }
type Post = { _id: string; title: string; content: string; authorId: string }

export function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')

  async function load() {
    const [p, c] = await Promise.all([
      api.get(`/api/posts/${id}`),
      api.get(`/api/comments?postId=${id}`),
    ])
    setPost(p.data)
    setComments(c.data.items)
  }

  useEffect(() => {
    load()
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000')
    socket.on('comment:created', (comment: Comment) => {
      if (comment.postId === id) setComments((prev) => [comment, ...prev])
    })
    return () => {
      socket.disconnect()
    }
  }, [id])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    await api.post('/api/comments', { postId: id, content })
    setContent('')
    await load()
  }

  if (!post) return <p>Cargando...</p>

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <h3>Comentarios</h3>
      {user && (
        <form onSubmit={onCreate}>
          <input placeholder="Comentario" value={content} onChange={(e) => setContent(e.target.value)} />
          <button type="submit">Enviar</button>
        </form>
      )}
      <ul>
        {comments.map((c) => (
          <li key={c._id}>{c.content}</li>
        ))}
      </ul>
    </div>
  )
}

