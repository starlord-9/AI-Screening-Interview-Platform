import { AIProvider } from './ai.interface';
import { DemoAIProvider } from './demo.ai';
import { AzureOpenAIProvider } from './azure.ai';
import { config } from '../../config';

export const demoAIProvider = new DemoAIProvider();
export const azureAIProvider = new AzureOpenAIProvider();

export const aiProvider: AIProvider =
  config.ai.provider === 'azure' ? azureAIProvider : demoAIProvider;

export * from './ai.interface';
export * from './demo.ai';
export * from './azure.ai';
