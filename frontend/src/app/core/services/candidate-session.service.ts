import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionQuestion {
  id: string;
  orderIndex: number;
  questionText: string;
  category: string;
  difficulty: string;
  expectedCompetency: string;
  timeLimitSeconds: number;
  answerType: 'TEXT' | 'AUDIO' | 'VIDEO' | 'CODING' | 'MULTIPLE_CHOICE';
  isRequired: boolean;
  codeStarterSnippet?: string;
  codeTestCases?: Array<{ description: string; input: string; expectedOutput: string }>;
}

export interface SessionState {
  sessionId: string;
  status: string;
  currentQuestionIndex: number;
  startedAt: string;
  candidateName: string;
  jobTitle: string;
  questions: SessionQuestion[];
  answeredQuestionIds: string[];
  timeLimitMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class CandidateSessionService {
  private readonly baseUrl = 'http://localhost:5000/api/candidate-sessions';

  constructor(private http: HttpClient) {}

  startSession(data: {
    token: string;
    consentedToRecording: boolean;
    consentedToAIAnalysis: boolean;
    consentedToIntegritySignals: boolean;
    browserInfo?: any;
  }): Observable<{ success: boolean; data: { sessionId: string; status: string; startedAt: string } }> {
    return this.http.post<any>(`${this.baseUrl}/start`, data);
  }

  getSessionState(sessionId: string): Observable<{ success: boolean; data: SessionState }> {
    return this.http.get<any>(`${this.baseUrl}/${sessionId}`);
  }

  submitResponse(
    sessionId: string,
    data: {
      questionId: string;
      responseMode: string;
      textContent?: string;
      codeSnippet?: string;
      codeLanguage?: string;
      codeExecutionResults?: any;
      durationSeconds: number;
    }
  ): Observable<{ success: boolean; data: any }> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/responses`, data);
  }

  uploadRecording(
    sessionId: string,
    questionId: string,
    blob: Blob,
    durationSeconds: number
  ): Observable<{ success: boolean; data: any }> {
    const formData = new FormData();
    formData.append('media', blob, `recording-${questionId}.webm`);
    formData.append('questionId', questionId);
    formData.append('durationSeconds', durationSeconds.toString());

    return this.http.post<any>(`${this.baseUrl}/${sessionId}/recordings`, formData);
  }

  runCode(
    sessionId: string,
    code: string,
    language: string,
    testCases: any[]
  ): Observable<{ success: boolean; data: any }> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/code-run`, {
      code,
      language,
      testCases
    });
  }

  recordIntegrityEvent(
    sessionId: string,
    event: {
      eventType: string;
      facts: string;
      evidence?: any;
      durationSeconds?: number;
      uncertainty?: string;
      severity?: string;
      browser?: string;
      device?: string;
    }
  ): Observable<{ success: boolean; data: any }> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/integrity-events`, event);
  }

  completeSession(sessionId: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/complete`, {});
  }
}
