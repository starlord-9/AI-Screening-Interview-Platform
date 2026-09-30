import { StorageProvider } from './storage.interface';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class AzureBlobStorageProvider implements StorageProvider {
  private accountName: string;
  private containerName: string;

  constructor() {
    this.accountName = config.storage.azureAccount;
    this.containerName = config.storage.azureContainer;
  }

  async uploadFile(filePath: string, destinationKey: string, mimeType: string): Promise<{ key: string; url: string }> {
    logger.info('Azure Blob Upload simulation/fallback', {
      account: this.accountName,
      container: this.containerName,
      key: destinationKey,
      mimeType
    });
    
    // In production with @azure/storage-blob:
    // BlobServiceClient.fromConnectionString(...)
    // containerClient.getBlockBlobClient(destinationKey).uploadFile(filePath, ...)
    const url = await this.getSignedDownloadUrl(destinationKey);
    return { key: destinationKey, url };
  }

  async getSignedDownloadUrl(key: string, expiresInMinutes = 60): Promise<string> {
    const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${key}?se=${expires}&sp=r&sv=2024-05-04&sig=azure-sas-signature-mock`;
  }

  async deleteFile(key: string): Promise<boolean> {
    logger.info('Azure Blob Deletion', { key });
    return true;
  }
}
