import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { StorageProvider } from './storage.interface';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.localDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(sourcePath: string, destinationKey: string): Promise<{ key: string; url: string }> {
    const targetPath = path.join(this.baseDir, destinationKey);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (sourcePath !== targetPath) {
      fs.copyFileSync(sourcePath, targetPath);
    }

    const url = await this.getSignedDownloadUrl(destinationKey);
    return { key: destinationKey, url };
  }

  async getSignedDownloadUrl(key: string, expiresInMinutes = 60): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    const signature = crypto
      .createHmac('sha256', config.jwt.secret)
      .update(`${key}:${expires}`)
      .digest('hex');

    return `${config.apiUrl}/api/recordings/stream/${encodeURIComponent(key)}?expires=${expires}&sig=${signature}`;
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error('Error deleting local file', { key, error: err.message });
      return false;
    }
  }

  verifySignature(key: string, expires: number, signature: string): boolean {
    if (Math.floor(Date.now() / 1000) > expires) {
      return false;
    }
    const expected = crypto
      .createHmac('sha256', config.jwt.secret)
      .update(`${key}:${expires}`)
      .digest('hex');
    return expected === signature;
  }
}
