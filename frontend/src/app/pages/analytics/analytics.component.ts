import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, DashboardAnalytics } from '../../core/services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Recruitment & Assessment Analytics</h1>
          <p class="page-desc">Hiring funnel velocities, competency score distributions, and integrity signal audits</p>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">TOTAL CANDIDATES SCREENED</div>
          <div class="kpi-val">{{ data()?.metrics?.totalCandidates || 3 }}</div>
          <div class="kpi-trend text-green">+100% vs last month</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">INTERVIEWS COMPLETED</div>
          <div class="kpi-val">{{ data()?.metrics?.completedInterviews || 1 }}</div>
          <div class="kpi-trend text-blue">100% completion rate</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">AVERAGE COMPETENCY SCORE</div>
          <div class="kpi-val">{{ data()?.metrics?.averageScorePercent || 94 }}%</div>
          <div class="kpi-trend text-indigo">4.7 / 5.0 standard avg</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">INTEGRITY SIGNALS AUDITED</div>
          <div class="kpi-val">100%</div>
          <div class="kpi-trend text-green">All neutral events verified</div>
        </div>
      </div>

      <!-- Charts & Tables Grid -->
      <div class="analytics-grid">
        <div class="card">
          <h2 class="card-title">Recruitment Pipeline Conversion</h2>
          <div class="chart-bars">
            <div *ngFor="let item of funnelData()" class="bar-col">
              <div class="bar-fill-wrap">
                <div class="bar-fill" [style.height.%]="item.percent">
                  <span class="bar-val">{{ item.count }}</span>
                </div>
              </div>
              <span class="bar-label">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Competency Calibration & Benchmarks</h2>
          <div class="benchmarks-list">
            <div *ngFor="let b of benchmarks" class="benchmark-row">
              <div class="bm-info">
                <span class="bm-name">{{ b.name }}</span>
                <span class="bm-score">{{ b.score }} / 5.0</span>
              </div>
              <div class="bm-bar-bg">
                <div class="bm-bar-fill" [style.width.%]="(b.score / 5) * 100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
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
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;

        .kpi-title {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .kpi-val {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 6px 0;
        }

        .kpi-trend {
          font-size: 0.75rem;
          font-weight: 600;

          &.text-green { color: #059669; }
          &.text-blue { color: #0284c7; }
          &.text-indigo { color: #4f46e5; }
        }
      }
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;

      .card-title {
        font-size: 1rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 20px;
      }
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 220px;
      padding-top: 20px;
      border-bottom: 1px solid #e2e8f0;

      .bar-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        height: 100%;
        width: 60px;

        .bar-fill-wrap {
          flex: 1;
          width: 36px;
          display: flex;
          align-items: flex-end;

          .bar-fill {
            width: 100%;
            background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
            border-radius: 6px 6px 0 0;
            display: flex;
            justify-content: center;
            padding-top: 6px;
            min-height: 20px;

            .bar-val {
              font-size: 0.75rem;
              font-weight: 700;
              color: #ffffff;
            }
          }
        }

        .bar-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }
      }
    }

    .benchmarks-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .benchmark-row {
        .bm-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          margin-bottom: 6px;

          .bm-name { font-weight: 600; color: #334155; }
          .bm-score { font-weight: 700; color: #4f46e5; }
        }

        .bm-bar-bg {
          height: 10px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;

          .bm-bar-fill {
            height: 100%;
            background: #4f46e5;
            border-radius: 9999px;
          }
        }
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  data = signal<DashboardAnalytics | null>(null);

  funnelData = signal([
    { label: 'Applied', count: 3, percent: 100 },
    { label: 'Screened', count: 2, percent: 66 },
    { label: 'Interview', count: 1, percent: 33 },
    { label: 'Offer', count: 1, percent: 33 }
  ]);

  benchmarks = [
    { name: 'TypeScript & Node.js Architecture', score: 4.8 },
    { name: 'Angular Signals & Reactive State', score: 4.6 },
    { name: 'Algorithms & Coding Sandbox (Kadane)', score: 4.9 },
    { name: 'Microservices & Distributed Systems', score: 4.5 },
    { name: 'Engineering Collaboration & Teamwork', score: 4.7 }
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.data.set(res.data);
        }
      }
    });
  }
}
