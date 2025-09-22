import fs from 'fs';
import path from 'path';

export function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

