const path = require('path');
const fs = require('fs');

// Load .env if present
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_ropa',
};

module.exports = { config };

