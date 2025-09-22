import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'
import type { Product } from './types'

type ProductsContextType = {
  products: Product[]
  loading: boolean
  refresh: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const res = await api.get('/api/shop/products')
    setProducts(res.data.items)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <ProductsContext.Provider value={{ products, loading, refresh }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}

