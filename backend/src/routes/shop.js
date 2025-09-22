import { Router } from 'express';
import { productsStore, ordersStore } from '../db/datastores.js';
import { authMiddleware, adminMiddleware } from './auth.js';
import Stripe from 'stripe';
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

// Admin: product CRUD + stock
shopRouter.post('/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  const p = req.body;
  if (!p?.name || !p?.price) return res.status(400).json({ error: 'Missing fields' });
  const product = { ...p, id: p.id || uuidv4(), stock: p.stock ?? 100 };
  await productsStore.insert(product);
  res.status(201).json(product);
});

shopRouter.put('/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const updated = await productsStore.update({ id: req.params.id }, { $set: { ...req.body } }, { returnUpdatedDocs: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

shopRouter.delete('/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const num = await productsStore.remove({ id: req.params.id }, { multi: false });
  if (!num) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Admin: orders list/update
shopRouter.get('/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  const items = await ordersStore.cfind({}).sort({ createdAt: -1 }).limit(500).exec();
  res.json({ items });
});

shopRouter.put('/admin/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const updated = await ordersStore.update({ _id: req.params.id }, { $set: { status: req.body.status } }, { returnUpdatedDocs: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

// Stripe checkout (optional)
shopRouter.post('/checkout/stripe', async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(400).json({ error: 'Stripe not configured' });
  const stripe = new Stripe(key, { apiVersion: '2025-04-30' });
  const { items, successUrl, cancelUrl } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map((i) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    })),
    success_url: successUrl || `${process.env.CLIENT_ORIGIN}/shop`,
    cancel_url: cancelUrl || `${process.env.CLIENT_ORIGIN}/shop/cart`,
  });
  res.json({ url: session.url });
});

