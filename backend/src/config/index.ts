import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  applicationUrl: process.env.APPLICATION_URL || 'http://localhost:4200',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-talentmind-ai-2026-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-talentmind-ai-2026-production',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localDir: process.env.STORAGE_LOCAL_DIR || path.resolve(__dirname, '../../uploads'),
    azureAccount: process.env.AZURE_STORAGE_ACCOUNT || 'talentmindstorage',
    azureKey: process.env.AZURE_STORAGE_KEY || '',
    azureContainer: process.env.AZURE_STORAGE_CONTAINER || 'interview-recordings'
  },
  
  ai: {
    provider: process.env.AI_PROVIDER || 'demo',
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    azureKey: process.env.AZURE_OPENAI_KEY || '',
    azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview'
  },
  
  speech: {
    provider: process.env.SPEECH_PROVIDER || 'demo',
    azureKey: process.env.AZURE_SPEECH_KEY || '',
    azureRegion: process.env.AZURE_SPEECH_REGION || 'eastus'
  },
  
  notifications: {
    provider: process.env.NOTIFICATION_PROVIDER || 'mock',
    emailFrom: process.env.EMAIL_FROM || 'no-reply@talentmind.ai',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  
  featureFlags: {
    enableAiInterviewer: process.env.ENABLE_AI_INTERVIEWER !== 'false',
    enableVideoRecording: process.env.ENABLE_VIDEO_RECORDING !== 'false',
    enableAudioRecording: process.env.ENABLE_AUDIO_RECORDING !== 'false',
    enableScreenSharing: process.env.ENABLE_SCREEN_SHARING !== 'false',
    enableIntegrityMonitoring: process.env.ENABLE_INTEGRITY_MONITORING !== 'false',
    enableTechnicalAssessment: process.env.ENABLE_TECHNICAL_ASSESSMENT !== 'false',
    enableCodingSandbox: process.env.ENABLE_CODING_SANDBOX !== 'false',
    enableAiRecruiterAssistant: process.env.ENABLE_AI_RECRUITER_ASSISTANT !== 'false'
  }
};
