import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/prisma';

describe('TalentMind AI Backend Test Suite', () => {
  let authToken = '';
  let candidateToken = 'priya-demo-active-invite-2026';

  beforeAll(async () => {
    // Authenticate as demo admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@acme-tech.example.com',
        password: 'Admin@123456'
      });

    if (loginRes.body && loginRes.body.data) {
      authToken = loginRes.body.data.accessToken;
    }
  });

  describe('1. Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('TalentMind AI Backend');
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@acme-tech.example.com',
          password: 'Admin@123456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.roleCode).toBe('ADMIN');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@acme-tech.example.com',
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@acme-tech.example.com');
    });
  });

  describe('3. Jobs & AI Job Description Analysis', () => {
    it('should list all jobs for the organization', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should extract structured competencies from raw job description', async () => {
      const res = await request(app)
        .post('/api/jobs/analyze-jd')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rawText: 'Looking for a Senior TypeScript and React developer with 4 years experience in cloud infrastructure.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requirements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Candidates & Evidence Mapping', () => {
    it('should list candidates with stage history', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve candidate profile with mapped resume evidence', async () => {
      const candidate = await prisma.candidate.findFirst({
        where: { email: 'alex.rivera.dev@example.com' }
      });
      expect(candidate).toBeDefined();

      const res = await request(app)
        .get(`/api/candidates/${candidate!.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Alex');
      expect(res.body.data.resumes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Zero-Registration Candidate Flow', () => {
    it('should validate candidate invitation token without user registration', async () => {
      const res = await request(app).get(`/api/invitations/public/${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.candidateName).toContain('Priya');
      expect(res.body.data.jobTitle).toBeDefined();
      expect(res.body.data.timeLimitMinutes).toBe(30);
      expect(res.body.data.isCompleted).toBe(false);
    });

    it('should start a session and record explicit candidate consent', async () => {
      const res = await request(app)
        .post('/api/candidate-sessions/start')
        .send({
          token: candidateToken,
          consentedToRecording: true,
          consentedToAIAnalysis: true,
          consentedToIntegritySignals: true,
          browserInfo: { browser: 'Chrome', platform: 'Linux' }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBeDefined();
      expect(res.body.data.status).toBe('ACTIVE');

      const sessionId = res.body.data.sessionId;

      // Submit an answer
      const stateRes = await request(app).get(`/api/candidate-sessions/${sessionId}`);
      expect(stateRes.status).toBe(200);
      const firstQ = stateRes.body.data.questions[0];

      const submitRes = await request(app)
        .post(`/api/candidate-sessions/${sessionId}/responses`)
        .send({
          questionId: firstQ.id,
          responseMode: 'TEXT',
          textContent: 'I have 5 years experience building robust Angular frontend systems with Node.js backends.',
          durationSeconds: 45
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.success).toBe(true);
    });
  });

  describe('6. Recruiter Review & Score Override', () => {
    it('should retrieve full review dashboard for completed interview session', async () => {
      const completedSession = await prisma.interviewSession.findFirst({
        where: { status: 'COMPLETED' },
        include: { responses: { include: { evaluation: true } } }
      });
      expect(completedSession).toBeDefined();

      const res = await request(app)
        .get(`/api/review/sessions/${completedSession!.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session.id).toBe(completedSession!.id);
      expect(res.body.data.responses.length).toBeGreaterThanOrEqual(1);

      // Verify that evaluations have quotes and competencies
      const evalResp = res.body.data.responses.find((r: any) => r.evaluation !== null);
      if (evalResp && evalResp.evaluation) {
        expect(evalResp.evaluation.competency).toBeDefined();
        expect(evalResp.evaluation.score).toBeGreaterThan(0);

        // Test human score override with justification
        const overrideRes = await request(app)
          .post(`/api/review/evaluations/${evalResp.evaluation.id}/override`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            humanScore: 4.8,
            overrideReason: 'Candidate demonstrated exceptional practical knowledge of Signals and Zone.js'
          });

        expect(overrideRes.status).toBe(200);
        expect(overrideRes.body.success).toBe(true);
        expect(overrideRes.body.data.isOverridden).toBe(true);
        expect(overrideRes.body.data.humanScore).toBe(4.8);
      }
    });
  });

  describe('7. AI Recruiter Assistant Grounded Q&A', () => {
    it('should answer grounded recruiter queries with citations', async () => {
      const candidate = await prisma.candidate.findFirst({
        where: { email: 'alex.rivera.dev@example.com' }
      });

      const res = await request(app)
        .post('/api/assistant/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'What did the candidate say regarding Angular Signals?',
          candidateId: candidate?.id
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toBeDefined();
      expect(Array.isArray(res.body.data.citations)).toBe(true);
    });
  });

  describe('8. Analytics & Funnel Dashboard', () => {
    it('should return recruitment funnel counts and average competency scores', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.activeJobs).toBeGreaterThanOrEqual(1);
      expect(res.body.data.funnel).toBeDefined();
    });
  });
});
