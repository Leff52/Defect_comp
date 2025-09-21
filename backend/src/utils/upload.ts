import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

const allowed = (process.env.ALLOWED_MIME || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
    return cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}. Разрешенные типы: ${allowed.join(', ')}`));
  }
  cb(null, true);
}

export const uploader = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: maxMb * 1024 * 1024, 
    files: 10, 
  },
});


export const getPublicPath = (filename: string): string => {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Недопустимое имя файла');
  }
  return path.join(uploadDir, filename);
};

export const getPublicUrl = (filename: string): string => {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Недопустимое имя файла');
  }
  return `/files/${filename}`;
};
