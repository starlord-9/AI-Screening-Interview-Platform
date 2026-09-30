import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AssistantCitation {
  source: string;
  quote: string;
  confidence: number;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: AssistantCitation[];
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly baseUrl = 'http://localhost:5000/api/assistant';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ask(query: string, candidateId?: string, jobId?: string): Observable<{
    success: boolean;
    data: { answer: string; citations: AssistantCitation[] };
  }> {
    return this.http.post<any>(
      `${this.baseUrl}/chat`,
      { query, candidateId, jobId },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
