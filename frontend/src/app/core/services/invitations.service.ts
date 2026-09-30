import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PublicInvitation {
  invitationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  interviewTitle: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  expiresAt: string;
  isCompleted: boolean;
  activeSessionId?: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationsService {
  private readonly baseUrl = 'http://localhost:5000/api/invitations';

  constructor(private http: HttpClient, private auth: AuthService) {}

  create(data: { candidateId: string; interviewId: string; expiresInDays?: number }): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(this.baseUrl, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  revoke(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.baseUrl}/${id}/revoke`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  validatePublicToken(token: string): Observable<{ success: boolean; data: PublicInvitation }> {
    return this.http.get<{ success: boolean; data: PublicInvitation }>(`${this.baseUrl}/public/${token}`);
  }
}
