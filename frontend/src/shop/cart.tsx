import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem, Product } from './types'
import { products } from './data'

type CartContextType = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string, variant?: { size?: string; color?: string }) => void
  updateQty: (productId: string, qty: number, variant?: { size?: string; color?: string }) => void
  clear: () => void
  totalItems: number
  totalPrice: number
  itemsDetailed: (CartItem & { product: Product })[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'shop_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartItem[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function keyOf(ci: CartItem) {
    return `${ci.productId}|${ci.size || ''}|${ci.color || ''}`
  }

  function add(item: CartItem) {
    setItems((prev) => {
      const map = new Map(prev.map((p) => [keyOf(p), p]))
      const k = keyOf(item)
      const existing = map.get(k)
      if (existing) existing.quantity += item.quantity
      else map.set(k, { ...item })
      return Array.from(map.values())
    })
  }

  function remove(productId: string, variant?: { size?: string; color?: string }) {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && (variant?.size ?? '') === (p.size ?? '') && (variant?.color ?? '') === (p.color ?? ''))))
  }

  function updateQty(productId: string, qty: number, variant?: { size?: string; color?: string }) {
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId && (variant?.size ?? '') === (p.size ?? '') && (variant?.color ?? '') === (p.color ?? '')
            ? { ...p, quantity: Math.max(1, qty) }
            : p,
        )
        .filter((p) => p.quantity > 0),
    )
  }

  function clear() {
    setItems([])
  }

  const itemsDetailed = useMemo(() => {
    return items
      .map((ci) => ({ ...ci, product: products.find((p) => p.id === ci.productId)! }))
      .filter((x) => Boolean(x.product))
  }, [items])

  const totalItems = useMemo(() => items.reduce((a, b) => a + b.quantity, 0), [items])
  const totalPrice = useMemo(() => itemsDetailed.reduce((a, b) => a + b.quantity * b.product.price, 0), [itemsDetailed])

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, totalItems, totalPrice, itemsDetailed }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

