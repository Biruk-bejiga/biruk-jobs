import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Router } from 'express';
import createHttpError from 'http-errors';
import multer from 'multer';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

const uploadRoot = path.join(process.cwd(), 'server', 'uploads');
const resumeDir = path.join(uploadRoot, 'resumes');

function ensureUploadDirs() {
  if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true });
  }
}

ensureUploadDirs();

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname ?? '').toLowerCase();
    const safeExt = extension && extension.length <= 6 ? extension : '';
    const name = `${Date.now()}-${crypto.randomUUID()}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(createHttpError(400, 'Only PDF or Word documents are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post('/resume', authenticate, authorizeRoles('employee'), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(createHttpError(400, err.message));
    }

    const file = req.file;
    if (!file) {
      return next(createHttpError(400, 'File is required'));
    }

    res.status(201).json({
      data: {
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/resumes/${file.filename}`,
      },
    });
  });
});

export default router;
