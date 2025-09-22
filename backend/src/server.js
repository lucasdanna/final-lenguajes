import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRouter } from './routes/auth.js';
import { postsRouter } from './routes/posts.js';
import { commentsRouter } from './routes/comments.js';
import { uploadRouter } from './routes/upload.js';
import { ensureUploadDir } from './utils/fs.js';
import { shopRouter } from './routes/shop.js';
import { usersStore } from './db/datastores.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Static uploads
ensureUploadDir();
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// Routers
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter(io));
app.use('/api/comments', commentsRouter(io));
app.use('/api/upload', uploadRouter);
app.use('/api/shop', shopRouter);

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Socket.IO
io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

const port = process.env.PORT || 4000;
async function ensureDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;
  const existing = await usersStore.findOne({ email: adminEmail });
  if (existing) return;
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await usersStore.insert({ _id: `admin-${Date.now()}`, name: 'Admin', email: adminEmail, passwordHash, role: 'admin' });
}

httpServer.listen(port, async () => {
  await ensureDefaultAdmin();
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

