import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewsService, InterviewPlan } from '../../core/services/interviews.service';
import { JobsService, Job } from '../../core/services/jobs.service';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="interviews-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Structured Interview Plans</h1>
          <p class="page-desc">AI-assisted interview authoring with standardized competency rubrics</p>
        </div>
        <button class="btn btn-primary" (click)="openGenerateModal()">
          <span class="material-icons-outlined">auto_awesome</span>
          <span>Generate Plan with AI</span>
        </button>
      </div>

      <!-- Plan Cards Grid -->
      <div class="plans-grid">
        <div *ngFor="let plan of plans()" class="plan-card">
          <div class="plan-header">
            <div>
              <span class="job-tag">{{ plan.job?.title || 'Senior Position' }}</span>
              <h2 class="plan-title">{{ plan.title }}</h2>
            </div>
            <span class="pub-badge" [class.published]="plan.isPublished">
              {{ plan.isPublished ? 'PUBLISHED' : 'DRAFT' }}
            </span>
          </div>

          <p class="plan-desc">{{ plan.description }}</p>

          <div class="plan-meta">
            <div class="meta-item">
              <span class="material-icons-outlined">timer</span>
              <span>{{ plan.timeLimitMinutes }} Minutes</span>
            </div>
            <div class="meta-item">
              <span class="material-icons-outlined">quiz</span>
              <span>{{ plan.questions?.length || plan.totalQuestions }} Questions</span>
            </div>
          </div>

          <!-- Questions Preview -->
          <div class="questions-accordion">
            <div class="accordion-title">Questions & Competency Rubric:</div>
            <div *ngFor="let q of plan.questions; let i = index" class="q-item">
              <div class="q-top">
                <span class="q-num">Q{{ i + 1 }}</span>
                <span class="q-type" [ngClass]="'type-' + q.answerType.toLowerCase()">{{ q.answerType }}</span>
                <span class="q-comp">{{ q.expectedCompetency }}</span>
              </div>
              <div class="q-text">{{ q.questionText }}</div>
            </div>
          </div>

          <div class="plan-footer">
            <button *ngIf="!plan.isPublished" class="btn btn-publish" (click)="publishPlan(plan.id)">
              <span class="material-icons-outlined">check_circle</span>
              <span>Publish & Enable Invites</span>
            </button>
            <span *ngIf="plan.isPublished" class="invite-enabled">
              <span class="material-icons-outlined">verified</span>
              <span>Active for candidate invites</span>
            </span>
          </div>
        </div>
      </div>

      <!-- AI Generator Modal -->
      <div *ngIf="showModal()" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">AI Interview Plan Generator</h2>
              <p class="modal-subtitle">Generate calibrated, competency-based questions grounded in job requirements</p>
            </div>
            <button class="modal-close" (click)="showModal.set(false)">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Select Target Job</label>
              <select [(ngModel)]="selectedJobId">
                <option value="" disabled selected>Choose a job...</option>
                <option *ngFor="let j of jobs()" [value]="j.id">{{ j.title }} ({{ j.department }})</option>
              </select>
            </div>

            <div class="form-group">
              <label>Interview Duration</label>
              <select [(ngModel)]="planDuration">
                <option [value]="15">15 Minutes (Express Screening - 3 Questions)</option>
                <option [value]="30">30 Minutes (Standard Technical - 5 Questions)</option>
                <option [value]="45">45 Minutes (In-depth Architecture - 7 Questions)</option>
              </select>
            </div>

            <div class="generator-note">
              <span class="material-icons-outlined">info</span>
              <span>The AI generator will synthesize introduction, technical theory, coding challenge, and communication questions.</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal.set(false)">Cancel</button>
            <button class="btn btn-primary" [disabled]="isGenerating() || !selectedJobId" (click)="generatePlan()">
              <span *ngIf="!isGenerating()">Generate Structured Plan</span>
              <span *ngIf="isGenerating()">Synthesizing Questions...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interviews-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
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
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
      gap: 20px;
    }

    .plan-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .job-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
        }

        .plan-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }

        .pub-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 9999px;
          background: #f1f5f9;
          color: #64748b;

          &.published {
            background: #ecfdf5;
            color: #059669;
          }
        }
      }

      .plan-desc {
        font-size: 0.8125rem;
        color: #475569;
        line-height: 1.5;
      }

      .plan-meta {
        display: flex;
        gap: 16px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #64748b;

          span.material-icons-outlined {
            font-size: 16px;
            color: #94a3b8;
          }
        }
      }

      .questions-accordion {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .accordion-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
        }

        .q-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;

          .q-top {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;

            .q-num {
              font-weight: 700;
              font-size: 0.75rem;
              color: #4f46e5;
            }

            .q-type {
              font-size: 0.625rem;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;

              &.type-video { background: #eff6ff; color: #2563eb; }
              &.type-coding { background: #fdf4ff; color: #a21caf; }
              &.type-audio { background: #f0fdf4; color: #15803d; }
              &.type-text { background: #fefce8; color: #854d0e; }
            }

            .q-comp {
              font-size: 0.6875rem;
              color: #64748b;
            }
          }

          .q-text {
            font-size: 0.8125rem;
            color: #1e293b;
          }
        }
      }

      .plan-footer {
        padding-top: 14px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .btn-publish {
          background: #10b981;
          color: #ffffff;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;

          &:hover {
            background: #059669;
          }
        }

        .invite-enabled {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;

          span.material-icons-outlined {
            font-size: 18px;
          }
        }
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 540px;
      padding: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #0f172a;
      }

      .modal-subtitle {
        font-size: 0.8125rem;
        color: #64748b;
        margin-top: 2px;
      }

      .modal-close {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
        }

        select {
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          background: #ffffff;
        }
      }

      .generator-note {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 0.75rem;
        color: #64748b;

        span.material-icons-outlined {
          color: #4f46e5;
          font-size: 18px;
        }
      }
    }

    .modal-footer {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class InterviewsComponent implements OnInit {
  plans = signal<InterviewPlan[]>([]);
  jobs = signal<Job[]>([]);
  showModal = signal(false);
  isGenerating = signal(false);
  selectedJobId = '';
  planDuration = 30;

  constructor(
    private interviewsService: InterviewsService,
    private jobsService: JobsService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.jobsService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.jobs.set(res.data);
          if (res.data.length > 0) {
            this.selectedJobId = res.data[0].id;
          }
        }
      }
    });
  }

  loadPlans(): void {
    this.interviewsService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.plans.set(res.data);
        }
      }
    });
  }

  openGenerateModal(): void {
    this.showModal.set(true);
  }

  generatePlan(): void {
    if (!this.selectedJobId) return;
    this.isGenerating.set(true);

    this.interviewsService.generatePlan(this.selectedJobId, Number(this.planDuration)).subscribe({
      next: () => {
        this.isGenerating.set(false);
        this.showModal.set(false);
        this.loadPlans();
      },
      error: () => {
        this.isGenerating.set(false);
      }
    });
  }

  publishPlan(id: string): void {
    this.interviewsService.publish(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadPlans();
        }
      }
    });
  }
}
