import { Router } from 'express';
import { productsStore, ordersStore } from '../db/datastores.js';
import { v4 as uuidv4 } from 'uuid';

export const shopRouter = Router();

// Seed some products on first run if empty
async function ensureSeed() {
  const count = await productsStore.count({});
  if (count > 0) return;
  const sample = [
    {
      id: 'ts-b-001',
      name: 'Camiseta Básica Negra',
      description: 'Camiseta de algodón 100% suave y cómoda.',
      price: 14.99,
      imageUrl: 'https://picsum.photos/seed/tsb/600/400',
      category: 'Camisetas',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Negro', 'Blanco'],
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
  ];
  for (const p of sample) await productsStore.insert(p);
}

shopRouter.get('/products', async (req, res) => {
  await ensureSeed();
  const items = await productsStore.cfind({}).sort({ name: 1 }).limit(200).exec();
  res.json({ items });
});

shopRouter.get('/products/:id', async (req, res) => {
  const product = await productsStore.findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

shopRouter.post('/orders', async (req, res) => {
  const { customer, items, total } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Empty order' });
  const order = {
    _id: uuidv4(),
    number: Math.floor(100000 + Math.random() * 900000),
    customer: customer || {},
    items,
    total,
    createdAt: Date.now(),
  };
  await ordersStore.insert(order);
  res.status(201).json(order);
});

