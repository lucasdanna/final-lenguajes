export type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  sizes: string[]
  colors: string[]
  tags?: string[]
}

export type CartItem = {
  productId: string
  quantity: number
  size?: string
  color?: string
}

