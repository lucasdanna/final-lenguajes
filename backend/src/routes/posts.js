import { Router } from 'express';
import { postsStore } from '../db/datastores.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from './auth.js';

export function postsRouter(io) {
  const router = Router();

  router.get('/', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;
    const total = await postsStore.count({});
    const items = await postsStore.cfind({}).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    res.json({ items, page, limit, total });
  });

  router.get('/:id', async (req, res) => {
    const post = await postsStore.findOne({ _id: req.params.id });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  });

  router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });
    const post = {
      _id: uuidv4(),
      title,
      content: content || '',
      authorId: req.user.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await postsStore.insert(post);
    io.emit('post:created', post);
    res.status(201).json(post);
  });

  router.put('/:id', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const updated = await postsStore.update(
      { _id: req.params.id, authorId: req.user.userId },
      { $set: { title, content, updatedAt: Date.now() } },
      { returnUpdatedDocs: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found or not owner' });
    io.emit('post:updated', updated);
    res.json(updated);
  });

  router.delete('/:id', authMiddleware, async (req, res) => {
    const numRemoved = await postsStore.remove({ _id: req.params.id, authorId: req.user.userId }, { multi: false });
    if (numRemoved === 0) return res.status(404).json({ error: 'Not found or not owner' });
    io.emit('post:deleted', { id: req.params.id });
    res.status(204).end();
  });

  return router;
}

