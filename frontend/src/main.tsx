import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { CartProvider } from './shop/cart'
import { ProductsProvider } from './shop/products'
import { AppLayout } from './ui/AppLayout'
import { LoginPage } from './ui/LoginPage'
import { RegisterPage } from './ui/RegisterPage'
import { PostsPage } from './ui/PostsPage'
import { PostDetailPage } from './ui/PostDetailPage'
import { CatalogPage } from './shop/CatalogPage'
import { ProductPage } from './shop/ProductPage'
import { CartPage } from './shop/CartPage'
import { CheckoutPage } from './shop/CheckoutPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <PostsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      { path: 'shop', element: <CatalogPage /> },
      { path: 'shop/product/:id', element: <ProductPage /> },
      { path: 'shop/cart', element: <CartPage /> },
      { path: 'shop/checkout', element: <CheckoutPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </StrictMode>,
)
