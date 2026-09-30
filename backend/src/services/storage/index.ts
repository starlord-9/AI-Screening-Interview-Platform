import { StorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { AzureBlobStorageProvider } from './azure.storage';
import { config } from '../../config';

export const localStorageProvider = new LocalStorageProvider();
export const azureStorageProvider = new AzureBlobStorageProvider();

export const storageProvider: StorageProvider =
  config.storage.provider === 'azure' ? azureStorageProvider : localStorageProvider;

export * from './storage.interface';
export * from './local.storage';
export * from './azure.storage';
