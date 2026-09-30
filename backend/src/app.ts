import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import { standardLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import organizationsRoutes from './routes/organizations.routes';
import usersRoutes from './routes/users.routes';
import jobsRoutes from './routes/jobs.routes';
import candidatesRoutes from './routes/candidates.routes';
import interviewsRoutes from './routes/interviews.routes';
import invitationsRoutes from './routes/invitations.routes';
import candidateSessionsRoutes from './routes/candidate-sessions.routes';
import reviewRoutes from './routes/review.routes';
import assistantRoutes from './routes/assistant.routes';
import analyticsRoutes from './routes/analytics.routes';
import auditRoutes from './routes/audit.routes';
import recordingsRoutes from './routes/recordings.routes';
import demoRoutes from './routes/demo.routes';

const app: Application = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global Rate Limiting
app.use(standardLimiter);

// Static uploads directory (for local file serving)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TalentMind AI Backend',
    version: '1.0.0'
  });
});

// API Routes Mounts
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/invitations', invitationsRoutes);
app.use('/api/candidate-sessions', candidateSessionsRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/recordings', recordingsRoutes);
app.use('/api/demo', demoRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
