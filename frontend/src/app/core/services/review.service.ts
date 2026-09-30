import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface EvaluationItem {
  id: string;
  competency: string;
  summary: string;
  quoteEvidenceJson?: string;
  strengthsJson?: string;
  gapsJson?: string;
  score: number;
  maxScore: number;
  confidence: number;
  isOverridden: boolean;
  humanScore?: number;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface ReviewResponse {
  id: string;
  questionId: string;
  responseMode: string;
  textContent?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  codeExecutionResults?: any;
  durationSeconds: number;
  question: {
    id: string;
    questionText: string;
    category: string;
    expectedCompetency: string;
    answerType: string;
  };
  recordings?: Array<{
    id: string;
    blobUrl: string;
    durationSeconds: number;
    mimeType: string;
  }>;
  transcript?: {
    id: string;
    fullText: string;
    segmentsJson: string;
    confidence: number;
  };
  evaluation?: EvaluationItem;
}

export interface IntegrityEventItem {
  id: string;
  eventType: string;
  timestamp: string;
  durationSeconds: number;
  facts: string;
  evidence?: string;
  uncertainty: string;
  severity: string;
  reviewStatus: string;
  reviewerId?: string;
  reviewComment?: string;
}

export interface SessionReviewData {
  session: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string;
    durationSeconds: number;
    consentedToRecording: boolean;
    consentedToAIAnalysis: boolean;
    consentedToIntegritySignals: boolean;
    browserInfo?: string;
  };
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    stage: string;
    resumes?: any[];
  };
  interview: {
    id: string;
    title: string;
    timeLimitMinutes: number;
    job: { title: string; department: string };
  };
  responses: ReviewResponse[];
  integrityEvents: IntegrityEventItem[];
  scoringSummary: {
    overallScore: number;
    maxScore: number;
    percentage: number;
    competencyScores: Record<string, { total: number; count: number; avg: number }>;
  };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly baseUrl = 'http://localhost:5000/api/review';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getSessionReview(sessionId: string): Observable<{ success: boolean; data: SessionReviewData }> {
    return this.http.get<{ success: boolean; data: SessionReviewData }>(
      `${this.baseUrl}/sessions/${sessionId}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  overrideScore(
    evaluationId: string,
    humanScore: number,
    overrideReason: string
  ): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/evaluations/${evaluationId}/override`,
      { humanScore, overrideReason },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  reviewIntegrityEvent(
    eventId: string,
    status: 'REVIEWED' | 'DISMISSED' | 'ACTIONED',
    comment: string
  ): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/integrity-events/${eventId}`,
      { status, comment },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
