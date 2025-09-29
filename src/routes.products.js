const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fssync = require('fs');
const { Product } = require('./models/Product');

const router = Router();

const uploadsRoot = path.join(__dirname, 'uploads');
if (!fssync.existsSync(uploadsRoot)) {
  fssync.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsRoot);
  },
  filename: function (_req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// JSON file storage removed; using MongoDB via Mongoose

router.get('/', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo producto' });
  }
});

// Campos esperados: name, description, price, category, sizes, colors, image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, sizes, colors } = req.body;
    if (!name || !price || !category) {
      if (req.file) {
        // Limpia archivo si validación falla
        try { await fs.unlink(req.file.path); } catch {}
      }
      return res.status(400).json({ error: 'Campos obligatorios: name, price, category' });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      if (req.file) {
        try { await fs.unlink(req.file.path); } catch {}
      }
      return res.status(400).json({ error: 'price debe ser un número >= 0' });
    }

    const toArray = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const product = await Product.create({
      name: String(name),
      description: description ? String(description) : '',
      price: numericPrice,
      category: String(category),
      sizes: toArray(sizes),
      colors: toArray(colors),
      imageUrl: req.file ? `/uploads/${path.basename(req.file.path)}` : null,
    });

    res.status(201).json(product.toJSON());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando producto' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const current = await Product.findById(id);
    if (!current) return res.status(404).json({ error: 'Producto no encontrado' });
    const updates = req.body || {};

    const maybeNumber = (val, fallback) => {
      if (val === undefined) return fallback;
      const n = Number(val);
      return Number.isNaN(n) ? fallback : n;
    };

    const toArray = (v, fallback) => {
      if (v === undefined) return fallback;
      if (Array.isArray(v)) return v;
      return String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    };

    if (req.file && current.imageUrl) {
      try {
        const old = path.join(uploadsRoot, path.basename(current.imageUrl));
        await fs.unlink(old);
      } catch {}
    }

    current.name = updates.name !== undefined ? String(updates.name) : current.name;
    current.description = updates.description !== undefined ? String(updates.description) : current.description;
    current.price = maybeNumber(updates.price, current.price);
    current.category = updates.category !== undefined ? String(updates.category) : current.category;
    current.sizes = toArray(updates.sizes, current.sizes);
    current.colors = toArray(updates.colors, current.colors);
    current.imageUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : current.imageUrl;

    await current.save();
    res.json(current.toJSON());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Product.findByIdAndDelete(id).lean();
    if (!removed) return res.status(404).json({ error: 'Producto no encontrado' });
    if (removed && removed.imageUrl) {
      try {
        const imgPath = path.join(uploadsRoot, path.basename(removed.imageUrl));
        await fs.unlink(imgPath);
      } catch {}
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminando producto' });
  }
});

module.exports = router;

