import { Router } from 'express';
import { commentsStore } from '../db/datastores.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from './auth.js';

export function commentsRouter(io) {
  const router = Router();

  router.get('/', async (req, res) => {
    const postId = req.query.postId;
    const query = postId ? { postId } : {};
    const items = await commentsStore.cfind(query).sort({ createdAt: -1 }).limit(100).exec();
    res.json({ items });
  });

  router.post('/', authMiddleware, async (req, res) => {
    const { postId, content } = req.body;
    if (!postId || !content) return res.status(400).json({ error: 'Missing fields' });
    const comment = {
      _id: uuidv4(),
      postId,
      content,
      authorId: req.user.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await commentsStore.insert(comment);
    io.emit('comment:created', comment);
    res.status(201).json(comment);
  });

  router.delete('/:id', authMiddleware, async (req, res) => {
    const numRemoved = await commentsStore.remove({ _id: req.params.id, authorId: req.user.userId }, { multi: false });
    if (numRemoved === 0) return res.status(404).json({ error: 'Not found or not owner' });
    io.emit('comment:deleted', { id: req.params.id });
    res.status(204).end();
  });

  return router;
}

