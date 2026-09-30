import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './errorHandler';
import { config } from '../config';

const localUploadDir = config.storage.localDir;
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new AppError('Invalid file type. Only PDF, DOCX, and TXT files are supported.', 400, 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

export const mediaUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'video/webm',
      'video/mp4',
      'audio/webm',
      'audio/ogg',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg'
    ];
    if (!allowedMime.includes(file.mimetype) && !file.mimetype.startsWith('video/') && !file.mimetype.startsWith('audio/')) {
      return cb(new AppError('Invalid media format. Supported formats: WebM, MP4, OGG, WAV.', 400, 'INVALID_MEDIA_TYPE'));
    }
    cb(null, true);
  }
});
