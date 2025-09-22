import { Product } from './types'

export const products: Product[] = [
  {
    id: 'ts-b-001',
    name: 'Camiseta Básica Negra',
    description: 'Camiseta de algodón 100% suave y cómoda.',
    price: 14.99,
    imageUrl: 'https://picsum.photos/seed/tsb/600/400',
    category: 'Camisetas',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Blanco'],
    tags: ['básico', 'algodón'],
  },
  {
    id: 'hd-z-101',
    name: 'Sudadera con Capucha Gris',
    description: 'Sudadera cálida con capucha y bolsillo canguro.',
    price: 39.9,
    imageUrl: 'https://picsum.photos/seed/hoodie/600/400',
    category: 'Sudaderas',
    sizes: ['S', 'M', 'L'],
    colors: ['Gris', 'Negro', 'Azul'],
  },
  {
    id: 'jk-d-220',
    name: 'Chaqueta Denim',
    description: 'Clásica chaqueta de mezclilla para todos los días.',
    price: 59.5,
    imageUrl: 'https://picsum.photos/seed/denim/600/400',
    category: 'Chaquetas',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul'],
  },
  {
    id: 'pt-c-330',
    name: 'Pantalón Chino Beige',
    description: 'Pantalón chino de corte slim para un look casual.',
    price: 44.0,
    imageUrl: 'https://picsum.photos/seed/chino/600/400',
    category: 'Pantalones',
    sizes: ['30', '32', '34', '36'],
    colors: ['Beige', 'Azul marino'],
  },
]

