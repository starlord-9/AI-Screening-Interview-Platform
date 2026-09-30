import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService, DashboardAnalytics } from '../../core/services/analytics.service';
import { CandidatesService, Candidate } from '../../core/services/candidates.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Recruitment Command Center</h1>
          <p class="page-desc">Real-time candidate pipeline, AI interview evaluations, and hiring analytics</p>
        </div>
        <div class="quick-actions">
          <a routerLink="/jobs" class="btn btn-primary">
            <span class="material-icons-outlined">add</span>
            <span>New Job Post</span>
          </a>
          <a routerLink="/interviews" class="btn btn-secondary">
            <span class="material-icons-outlined">auto_awesome</span>
            <span>AI Plan Generator</span>
          </a>
        </div>
      </div>

      <!-- Human-in-the-loop Governance Banner -->
      <div class="ethics-banner">
        <div class="ethics-icon">
          <span class="material-icons-outlined">verified_user</span>
        </div>
        <div class="ethics-text">
          <div class="ethics-title">Human-in-the-Loop AI Governance Active</div>
          <div class="ethics-desc">
            TalentMind AI extracts objective evidence, transcribes answers, and highlights competency matches.
            Final hiring, progression, and rejection decisions remain strictly with authorized human recruiters.
          </div>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon icon-indigo">
            <span class="material-icons-outlined">work</span>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics()?.metrics?.activeJobs || 2 }}</div>
            <div class="metric-label">Active Job Postings</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon icon-sky">
            <span class="material-icons-outlined">people</span>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics()?.metrics?.totalCandidates || 3 }}</div>
            <div class="metric-label">Screened Candidates</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon icon-emerald">
            <span class="material-icons-outlined">check_circle</span>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics()?.metrics?.completedInterviews || 1 }}</div>
            <div class="metric-label">Completed Interviews</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon icon-amber">
            <span class="material-icons-outlined">pending_actions</span>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics()?.metrics?.pendingInvites || 1 }}</div>
            <div class="metric-label">Active Invitations</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon icon-purple">
            <span class="material-icons-outlined">grade</span>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics()?.metrics?.averageScorePercent || 88 }}%</div>
            <div class="metric-label">Avg Competency Match</div>
          </div>
        </div>
      </div>

      <!-- Main Columns -->
      <div class="dashboard-columns">
        <!-- Left: Funnel & Competencies -->
        <div class="column-left">
          <div class="card mb-4">
            <div class="card-header">
              <h2 class="card-title">Recruitment Pipeline Funnel</h2>
              <a routerLink="/pipeline" class="card-link">View Kanban &rarr;</a>
            </div>
            <div class="funnel-container">
              <div *ngFor="let step of funnelSteps()" class="funnel-bar-row">
                <div class="funnel-label">{{ formatStage(step.stage) }}</div>
                <div class="funnel-bar-wrapper">
                  <div class="funnel-bar" [style.width.%]="step.percent">
                    <span class="funnel-count">{{ step.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Competency Evaluation Benchmarks</h2>
            </div>
            <div class="competencies-list">
              <div class="comp-item">
                <div class="comp-info">
                  <span class="comp-name">Full-Stack Architecture & Microservices</span>
                  <span class="comp-score">4.8 / 5.0</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: 96%"></div></div>
              </div>
              <div class="comp-item">
                <div class="comp-info">
                  <span class="comp-name">Frontend Architecture & Angular Signals</span>
                  <span class="comp-score">4.6 / 5.0</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: 92%"></div></div>
              </div>
              <div class="comp-item">
                <div class="comp-info">
                  <span class="comp-name">Algorithms & Problem Solving</span>
                  <span class="comp-score">4.9 / 5.0</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: 98%"></div></div>
              </div>
              <div class="comp-item">
                <div class="comp-info">
                  <span class="comp-name">Technical Communication & Collaboration</span>
                  <span class="comp-score">4.5 / 5.0</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: 90%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Recent Candidates & Quick Review -->
        <div class="column-right">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Recent Candidate Activity</h2>
              <a routerLink="/candidates" class="card-link">View All &rarr;</a>
            </div>

            <div class="candidates-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Title</th>
                    <th>Stage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of recentCandidates()">
                    <td>
                      <div class="candidate-cell">
                        <div class="candidate-avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>
                        <div>
                          <div class="candidate-name">{{ c.firstName }} {{ c.lastName }}</div>
                          <div class="candidate-email">{{ c.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="job-title-text">{{ c.candidateJobs?.[0]?.job?.title || 'Senior Full Stack Engineer' }}</span>
                    </td>
                    <td>
                      <span class="stage-chip" [ngClass]="'stage-' + c.stage.toLowerCase()">
                        {{ formatStage(c.stage) }}
                      </span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <ng-container *ngIf="c.invitations?.[0]?.sessions?.[0]?.id; else pendingTpl">
                          <a [routerLink]="['/review', c.invitations[0].sessions[0].id]" class="btn-review">
                            <span class="material-icons-outlined">fact_check</span>
                            <span>Review AI Evidence</span>
                          </a>
                        </ng-container>
                        <ng-template #pendingTpl>
                          <a [routerLink]="['/candidate/interview', 'priya-demo-active-invite-2026']" target="_blank" class="btn-open-invite">
                            <span class="material-icons-outlined">open_in_new</span>
                            <span>Candidate Link</span>
                          </a>
                        </ng-template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
      }

      .page-desc {
        font-size: 0.875rem;
        color: #64748b;
        margin-top: 4px;
      }

      .quick-actions {
        display: flex;
        gap: 12px;
      }
    }

    .ethics-banner {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 14px;

      .ethics-icon {
        color: #15803d;
        span { font-size: 28px; }
      }

      .ethics-title {
        font-weight: 700;
        font-size: 0.875rem;
        color: #14532d;
      }

      .ethics-desc {
        font-size: 0.8125rem;
        color: #166534;
        margin-top: 2px;
        line-height: 1.4;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;

      .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .metric-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;

          span { font-size: 24px; }

          &.icon-indigo { background: #eef2ff; color: #4f46e5; }
          &.icon-sky { background: #f0f9ff; color: #0284c7; }
          &.icon-emerald { background: #ecfdf5; color: #059669; }
          &.icon-amber { background: #fffbeb; color: #d97706; }
          &.icon-purple { background: #f5f3ff; color: #7c3aed; }
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          margin-top: 4px;
        }
      }
    }

    .dashboard-columns {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 24px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;

      &.mb-4 {
        margin-bottom: 24px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        .card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .card-link {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #4f46e5;
        }
      }
    }

    .funnel-container {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .funnel-bar-row {
        display: flex;
        align-items: center;
        gap: 12px;

        .funnel-label {
          width: 140px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #475569;
        }

        .funnel-bar-wrapper {
          flex: 1;
          height: 24px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;

          .funnel-bar {
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #6366f1);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 8px;
            min-width: 24px;

            .funnel-count {
              color: #ffffff;
              font-size: 0.75rem;
              font-weight: 700;
            }
          }
        }
      }
    }

    .competencies-list {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .comp-item {
        .comp-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          margin-bottom: 6px;

          .comp-name {
            font-weight: 600;
            color: #334155;
          }

          .comp-score {
            font-weight: 700;
            color: #4f46e5;
          }
        }

        .progress-bar {
          height: 8px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: #4f46e5;
            border-radius: 9999px;
          }
        }
      }
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th {
        text-align: left;
        padding: 10px 12px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .candidate-cell {
        display: flex;
        align-items: center;
        gap: 10px;

        .candidate-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #334155;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .candidate-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
        }

        .candidate-email {
          font-size: 0.75rem;
          color: #94a3b8;
        }
      }

      .job-title-text {
        font-size: 0.8125rem;
        color: #334155;
      }

      .stage-chip {
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 9999px;
        display: inline-block;

        &.stage-applied { background: #f1f5f9; color: #475569; }
        &.stage-screening { background: #eff6ff; color: #2563eb; }
        &.stage-interview_completed { background: #ecfdf5; color: #059669; }
      }

      .btn-review {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: #4f46e5;
        color: #ffffff;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        transition: background 0.15s ease;

        span.material-icons-outlined { font-size: 16px; }

        &:hover {
          background: #4338ca;
        }
      }

      .btn-open-invite {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        color: #0284c7;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;

        span.material-icons-outlined { font-size: 16px; }

        &:hover {
          background: #f0f9ff;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  analytics = signal<DashboardAnalytics | null>(null);
  recentCandidates = signal<Candidate[]>([]);

  funnelSteps = signal([
    { stage: 'APPLIED', count: 3, percent: 100 },
    { stage: 'SCREENING', count: 2, percent: 66 },
    { stage: 'INTERVIEW_COMPLETED', count: 1, percent: 33 },
    { stage: 'FINAL_REVIEW', count: 1, percent: 33 }
  ]);

  constructor(
    private analyticsService: AnalyticsService,
    private candidatesService: CandidatesService
  ) {}

  ngOnInit(): void {
    this.analyticsService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.analytics.set(res.data);
        }
      }
    });

    this.candidatesService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.recentCandidates.set(res.data);
        }
      }
    });
  }

  formatStage(stage: string): string {
    return stage
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
