import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { seedDatabase } from './db/seed';

const server = app.listen(config.port, async () => {
  logger.info(`TalentMind AI Backend running on port ${config.port} [${config.env}]`);
  logger.info(`Application URL: ${config.applicationUrl}`);
  logger.info(`API Base URL: ${config.apiUrl}`);

  try {
    // Seed database with realistic demo accounts & data
    await seedDatabase();
  } catch (err: any) {
    logger.error('Failed to auto-seed database:', { error: err.message });
  }
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
