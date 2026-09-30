import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface InterviewQuestion {
  id?: string;
  orderIndex: number;
  questionText: string;
  category: 'INTRODUCTION' | 'RESUME_VALIDATION' | 'TECHNICAL' | 'PROBLEM_SOLVING' | 'BEHAVIORAL' | 'SITUATIONAL' | 'CODING' | 'CANDIDATE_QUESTIONS';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  expectedCompetency: string;
  timeLimitSeconds: number;
  answerType: 'TEXT' | 'AUDIO' | 'VIDEO' | 'CODING' | 'MULTIPLE_CHOICE';
  isRequired?: boolean;
  scoringCriteria?: any;
  followUpRules?: any;
  codeStarterSnippet?: string;
  codeTestCases?: any[];
}

export interface InterviewPlan {
  id: string;
  title: string;
  description: string;
  jobId: string;
  job?: { id: string; title: string; department: string };
  version: number;
  isPublished: boolean;
  timeLimitMinutes: number;
  totalQuestions: number;
  scoringRubric?: any;
  questions: InterviewQuestion[];
  invitationsCount?: number;
  sessionsCount?: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewsService {
  private readonly baseUrl = 'http://localhost:5000/api/interviews';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(jobId?: string): Observable<{ success: boolean; data: InterviewPlan[] }> {
    return this.http.get<{ success: boolean; data: InterviewPlan[] }>(this.baseUrl, {
      headers: this.auth.getAuthHeaders(),
      params: jobId ? { jobId } : {}
    });
  }

  getById(id: string): Observable<{ success: boolean; data: InterviewPlan }> {
    return this.http.get<{ success: boolean; data: InterviewPlan }>(`${this.baseUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(plan: Partial<InterviewPlan>): Observable<{ success: boolean; data: InterviewPlan }> {
    return this.http.post<{ success: boolean; data: InterviewPlan }>(this.baseUrl, plan, {
      headers: this.auth.getAuthHeaders()
    });
  }

  generatePlan(jobId: string, durationMinutes: number = 30): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/generate-plan`,
      { jobId, durationMinutes },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  publish(id: string): Observable<{ success: boolean; data: InterviewPlan }> {
    return this.http.post<{ success: boolean; data: InterviewPlan }>(
      `${this.baseUrl}/${id}/publish`,
      {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  addQuestion(interviewId: string, question: Partial<InterviewQuestion>): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/${interviewId}/questions`,
      question,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deleteQuestion(interviewId: string, questionId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${interviewId}/questions/${questionId}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
