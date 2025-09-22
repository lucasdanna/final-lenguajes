import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { AppLayout } from './ui/AppLayout'
import { LoginPage } from './ui/LoginPage'
import { RegisterPage } from './ui/RegisterPage'
import { PostsPage } from './ui/PostsPage'
import { PostDetailPage } from './ui/PostDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <PostsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
