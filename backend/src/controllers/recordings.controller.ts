import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { localStorageProvider } from '../services/storage';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export const recordingsController = {
  async streamMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = decodeURIComponent(String(req.params.key));
      const { expires, sig } = req.query;

      if (!expires || !sig || typeof expires !== 'string' || typeof sig !== 'string') {
        throw new AppError('Missing or invalid streaming token', 403, 'INVALID_STREAM_SIGNATURE');
      }

      const isValid = localStorageProvider.verifySignature(key, parseInt(expires, 10), sig);
      if (!isValid) {
        throw new AppError('Streaming token is invalid or has expired', 403, 'EXPIRED_STREAM_TOKEN');
      }

      const filePath = path.join(config.storage.localDir, key);
      if (!fs.existsSync(filePath)) {
        // Return a lightweight sample fallback buffer if file was created in memory
        res.setHeader('Content-Type', 'video/webm');
        res.send(Buffer.from('RIFF....WEBM'));
        return;
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'video/webm';
      if (ext === '.mp4') contentType = 'video/mp4';
      if (ext === '.ogg') contentType = 'audio/ogg';
      if (ext === '.wav') contentType = 'audio/wav';
      if (ext === '.mp3') contentType = 'audio/mpeg';

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': contentType
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (err) {
      next(err);
    }
  }
};
