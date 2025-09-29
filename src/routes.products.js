const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fssync = require('fs');
const { v4: uuidv4 } = require('uuid');

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

const DB_PATH = path.join(__dirname, 'db.json');

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw || '{"products":[]}');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(DB_PATH, JSON.stringify({ products: [] }, null, 2));
      return { products: [] };
    }
    throw err;
  }
}

async function writeDb(data) {
  const tmp = DB_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DB_PATH);
}

router.get('/', async (_req, res) => {
  try {
    const db = await readDb();
    res.json(db.products);
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await readDb();
    const product = db.products.find((p) => p.id === req.params.id);
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

    const product = {
      id: uuidv4(),
      name: String(name),
      description: description ? String(description) : '',
      price: numericPrice,
      category: String(category),
      sizes: toArray(sizes),
      colors: toArray(colors),
      imageUrl: req.file ? `/uploads/${path.basename(req.file.path)}` : null,
      createdAt: new Date().toISOString(),
    };

    const db = await readDb();
    db.products.push(product);
    await writeDb(db);

    res.status(201).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando producto' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const current = db.products[idx];
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

    const updated = {
      ...current,
      name: updates.name !== undefined ? String(updates.name) : current.name,
      description: updates.description !== undefined ? String(updates.description) : current.description,
      price: maybeNumber(updates.price, current.price),
      category: updates.category !== undefined ? String(updates.category) : current.category,
      sizes: toArray(updates.sizes, current.sizes),
      colors: toArray(updates.colors, current.colors),
      imageUrl: req.file ? `/uploads/${path.basename(req.file.path)}` : current.imageUrl,
      updatedAt: new Date().toISOString(),
    };

    db.products[idx] = updated;
    await writeDb(db);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    const [removed] = db.products.splice(idx, 1);
    await writeDb(db);
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

