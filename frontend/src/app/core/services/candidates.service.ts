import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ResumeEvidence {
  id: string;
  jobRequirementId: string;
  quote: string;
  section: string;
  confidenceScore: number;
  matchLevel: 'STRONG' | 'PARTIAL' | 'WEAK' | 'NONE';
  gapAnalysis: string;
  jobRequirement?: { text: string; category: string; weight: number };
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  stage: string;
  notes?: string;
  resumes?: Array<{
    id: string;
    fileName: string;
    parsedDataJson: string;
    skillsJson: string;
    experienceJson: string;
    educationJson: string;
    evidenceMatches?: ResumeEvidence[];
  }>;
  candidateJobs?: Array<{
    id: string;
    jobId: string;
    currentStage: string;
    matchScore: number;
    job: { title: string; department: string };
  }>;
  stageHistory?: Array<{
    id: string;
    previousStage: string;
    newStage: string;
    changedBy: string;
    note: string;
    createdAt: string;
  }>;
  recruiterNotes?: Array<{
    id: string;
    noteText: string;
    isPrivate: boolean;
    user: { firstName: string; lastName: string };
    createdAt: string;
  }>;
  invitations?: Array<{
    id: string;
    status: string;
    rawTokenHint: string;
    expiresAt: string;
    interview: { title: string };
    sessions: Array<{ id: string; status: string; completedAt: string }>;
  }>;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private readonly baseUrl = 'http://localhost:5000/api/candidates';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(stage?: string, jobId?: string): Observable<{ success: boolean; data: Candidate[] }> {
    let params: any = {};
    if (stage) params.stage = stage;
    if (jobId) params.jobId = jobId;

    return this.http.get<{ success: boolean; data: Candidate[] }>(this.baseUrl, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  getById(id: string): Observable<{ success: boolean; data: Candidate }> {
    return this.http.get<{ success: boolean; data: Candidate }>(`${this.baseUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(data: { firstName: string; lastName: string; email: string; phone?: string; jobId?: string }): Observable<{ success: boolean; data: Candidate }> {
    return this.http.post<{ success: boolean; data: Candidate }>(this.baseUrl, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  uploadResume(candidateId: string, file: File, jobId?: string): Observable<{ success: boolean; data: any }> {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobId) formData.append('jobId', jobId);

    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/${candidateId}/resume`,
      formData,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  updateStage(candidateId: string, newStage: string, note?: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/${candidateId}/stage`,
      { newStage, note },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  addNote(candidateId: string, noteText: string, isPrivate: boolean = false): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/${candidateId}/notes`,
      { noteText, isPrivate },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
