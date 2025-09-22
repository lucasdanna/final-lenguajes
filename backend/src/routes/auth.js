import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersStore } from '../db/datastores.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

export const authRouter = Router();

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await usersStore.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const usersCount = await usersStore.count({});
  const role = (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === email) || usersCount === 0 ? 'admin' : 'user';
  const user = { _id: uuidv4(), name: name || email.split('@')[0], email, passwordHash, role };
  await usersStore.insert(user);
  const token = signToken({ userId: user._id, email: user.email, role: user.role });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await usersStore.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ userId: user._id, email: user.email, role: user.role || 'user' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role || 'user' } });
});

authRouter.get('/me', authMiddleware, async (req, res) => {
  const user = await usersStore.findOne({ _id: req.user.userId });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role || 'user' });
});

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

export { authMiddleware, adminMiddleware };

