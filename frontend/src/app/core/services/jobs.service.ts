import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface JobRequirement {
  id?: string;
  category: string;
  text: string;
  weight: number;
  isMandatory: boolean;
  sourceParagraph?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  education?: string;
  screeningCriteria: string[];
  status: string;
  interviewDurationMinutes: number;
  interviewMode: string;
  requirements: JobRequirement[];
  candidatesCount?: number;
  interviewsCount?: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly baseUrl = 'http://localhost:5000/api/jobs';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(): Observable<{ success: boolean; data: Job[] }> {
    return this.http.get<{ success: boolean; data: Job[] }>(this.baseUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getById(id: string): Observable<{ success: boolean; data: Job }> {
    return this.http.get<{ success: boolean; data: Job }>(`${this.baseUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(jobData: Partial<Job>): Observable<{ success: boolean; data: Job }> {
    return this.http.post<{ success: boolean; data: Job }>(this.baseUrl, jobData, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, jobData: Partial<Job>): Observable<{ success: boolean; data: Job }> {
    return this.http.put<{ success: boolean; data: Job }>(`${this.baseUrl}/${id}`, jobData, {
      headers: this.auth.getAuthHeaders()
    });
  }

  analyzeRawJD(description: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.baseUrl}/analyze-raw-jd`,
      { description },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
