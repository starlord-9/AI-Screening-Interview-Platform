export interface StorageProvider {
  uploadFile(filePath: string, destinationKey: string, mimeType: string): Promise<{ key: string; url: string }>;
  getSignedDownloadUrl(key: string, expiresInMinutes?: number): Promise<string>;
  deleteFile(key: string): Promise<boolean>;
}
