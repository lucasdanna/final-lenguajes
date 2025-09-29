const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRouter = require('./routes.products');
const mongoose = require('mongoose');
const { config } = require('./config');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static assets
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure upload dir exists
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/', express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

// API routes
app.use('/api/products', productsRouter);

// Fallback to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = config.port;

async function start() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Conectado a MongoDB:', config.mongoUri);
  } catch (err) {
    console.error('No se pudo conectar a MongoDB', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

start();

