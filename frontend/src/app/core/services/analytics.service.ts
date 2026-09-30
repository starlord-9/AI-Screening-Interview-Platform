import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DashboardAnalytics {
  metrics: {
    activeJobs: number;
    totalCandidates: number;
    completedInterviews: number;
    pendingInvites: number;
    averageScorePercent: number;
  };
  funnel: Array<{ stage: string; count: number }>;
  stageDistribution: Record<string, number>;
  competencyAverages: Array<{ competency: string; averageScore: number }>;
  integritySignalsSummary: {
    totalEvents: number;
    unreviewedEvents: number;
    reviewedEvents: number;
    highSeverityEvents: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly baseUrl = 'http://localhost:5000/api/analytics';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getDashboard(): Observable<{ success: boolean; data: DashboardAnalytics }> {
    return this.http.get<{ success: boolean; data: DashboardAnalytics }>(
      `${this.baseUrl}/dashboard`,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
