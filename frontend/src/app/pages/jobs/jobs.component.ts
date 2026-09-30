import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobsService, Job } from '../../core/services/jobs.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="jobs-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Openings</h1>
          <p class="page-desc">Define positions, map competency requirements, and author interview criteria</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <span class="material-icons-outlined">add</span>
          <span>Create New Job</span>
        </button>
      </div>

      <!-- Jobs Grid -->
      <div class="jobs-grid">
        <div *ngFor="let job of jobs()" class="job-card">
          <div class="job-header">
            <div>
              <div class="job-department">{{ job.department }}</div>
              <h2 class="job-title">{{ job.title }}</h2>
            </div>
            <span class="status-badge" [ngClass]="'status-' + job.status.toLowerCase()">
              {{ job.status }}
            </span>
          </div>

          <div class="job-meta">
            <div class="meta-item">
              <span class="material-icons-outlined">place</span>
              <span>{{ job.location }}</span>
            </div>
            <div class="meta-item">
              <span class="material-icons-outlined">schedule</span>
              <span>{{ job.employmentType }}</span>
            </div>
            <div class="meta-item">
              <span class="material-icons-outlined">timer</span>
              <span>{{ job.interviewDurationMinutes }} min AI Interview</span>
            </div>
          </div>

          <p class="job-desc">{{ job.description }}</p>

          <div class="skills-chips">
            <span *ngFor="let s of job.requiredSkills" class="skill-chip">
              {{ s }}
            </span>
          </div>

          <div class="job-footer">
            <div class="job-stats">
              <span><strong>{{ job.requirements?.length || 4 }}</strong> Competencies</span>
              <span>&bull;</span>
              <span><strong>{{ job.interviewMode }}</strong> Mode</span>
            </div>
            <button class="btn-detail" (click)="selectJob(job)">
              <span>View Details</span>
              <span class="material-icons-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Create Job Modal with AI JD Parser -->
      <div *ngIf="showModal()" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Create Job Posting with AI Analysis</h2>
              <p class="modal-subtitle">Paste raw job description text to automatically extract structured requirements</p>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- AI JD Extraction Box -->
            <div class="ai-box">
              <div class="ai-box-title">
                <span class="material-icons-outlined">auto_awesome</span>
                <span>AI Job Description Auto-Extractor</span>
              </div>
              <p class="ai-box-desc">
                Paste any unformatted job description. TalentMind AI will parse required skills, responsibilities, and map structured competency weights.
              </p>
              <textarea
                [(ngModel)]="rawJdInput"
                class="ai-textarea"
                rows="4"
                placeholder="Paste JD text here (e.g. 'We are hiring a Senior TypeScript and Cloud architect with 5+ years of experience in distributed systems...')"
              ></textarea>
              <button
                type="button"
                [disabled]="isAnalyzing() || !rawJdInput.trim()"
                (click)="analyzeJD()"
                class="btn-ai-analyze"
              >
                <span *ngIf="!isAnalyzing()">Extract Structured Competencies</span>
                <span *ngIf="isAnalyzing()">Analyzing Requirements...</span>
              </button>
            </div>

            <!-- Form Fields -->
            <div class="form-grid">
              <div class="form-group">
                <label>Job Title</label>
                <input type="text" [(ngModel)]="newJob.title" placeholder="e.g. Staff Full Stack Engineer" />
              </div>
              <div class="form-group">
                <label>Department</label>
                <input type="text" [(ngModel)]="newJob.department" placeholder="e.g. Engineering" />
              </div>
              <div class="form-group">
                <label>Location</label>
                <input type="text" [(ngModel)]="newJob.location" placeholder="e.g. Remote (US / Global)" />
              </div>
              <div class="form-group">
                <label>Interview Duration (Minutes)</label>
                <input type="number" [(ngModel)]="newJob.interviewDurationMinutes" />
              </div>
            </div>

            <div class="form-group">
              <label>Role Summary</label>
              <textarea [(ngModel)]="newJob.description" rows="3" placeholder="Brief summary of the position..."></textarea>
            </div>

            <!-- Extracted Skills -->
            <div *ngIf="extractedSkills().length > 0" class="extracted-section">
              <div class="section-label">AI Extracted Required Skills</div>
              <div class="skills-chips">
                <span *ngFor="let skill of extractedSkills()" class="skill-chip active">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" [disabled]="isSubmitting() || !newJob.title" (click)="submitJob()">
              <span *ngIf="!isSubmitting()">Create Job & Criteria</span>
              <span *ngIf="isSubmitting()">Saving...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jobs-page {
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

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .job-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
      }

      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .job-department {
          font-size: 0.75rem;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .job-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }

        .status-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 9999px;

          &.status-active { background: #ecfdf5; color: #059669; }
          &.status-draft { background: #f1f5f9; color: #64748b; }
        }
      }

      .job-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 14px;

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

      .job-desc {
        font-size: 0.8125rem;
        color: #475569;
        line-height: 1.5;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .skills-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 20px;
        flex: 1;

        .skill-chip {
          background: #f1f5f9;
          color: #334155;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;

          &.active {
            background: #eef2ff;
            color: #4f46e5;
          }
        }
      }

      .job-footer {
        padding-top: 14px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .job-stats {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-detail {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #4f46e5;
          font-size: 0.8125rem;
          font-weight: 600;

          span.material-icons-outlined {
            font-size: 16px;
          }

          &:hover {
            color: #3730a3;
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
      max-width: 700px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

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
        padding: 4px;

        &:hover { color: #0f172a; }
      }
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .ai-box {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border: 1px solid #ddd6fe;
      border-radius: 12px;
      padding: 16px;

      .ai-box-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 0.875rem;
        color: #6d28d9;
      }

      .ai-box-desc {
        font-size: 0.75rem;
        color: #7c3aed;
        margin: 4px 0 10px;
      }

      .ai-textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #c4b5fd;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-family: inherit;
        background: #ffffff;
        outline: none;

        &:focus {
          border-color: #7c3aed;
        }
      }

      .btn-ai-analyze {
        margin-top: 10px;
        padding: 8px 16px;
        background: #7c3aed;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #6d28d9;
        }

        &:disabled {
          opacity: 0.6;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #334155;
      }

      input, textarea {
        padding: 10px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.875rem;
        font-family: inherit;
        outline: none;

        &:focus {
          border-color: #4f46e5;
        }
      }
    }

    .extracted-section {
      .section-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        margin-bottom: 8px;
      }
    }

    .modal-footer {
      padding: 18px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class JobsComponent implements OnInit {
  jobs = signal<Job[]>([]);
  showModal = signal(false);
  isAnalyzing = signal(false);
  isSubmitting = signal(false);
  rawJdInput = '';
  extractedSkills = signal<string[]>([]);

  newJob: Partial<Job> = {
    title: '',
    department: 'Engineering',
    location: 'Remote (US/Global)',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    interviewDurationMinutes: 30,
    interviewMode: 'AI_ASYNC',
    description: '',
    requiredSkills: []
  };

  constructor(private jobsService: JobsService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobsService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.jobs.set(res.data);
        }
      }
    });
  }

  openCreateModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.rawJdInput = '';
    this.extractedSkills.set([]);
  }

  selectJob(job: Job): void {
    // Navigate or view details
  }

  analyzeJD(): void {
    if (!this.rawJdInput.trim()) return;
    this.isAnalyzing.set(true);

    this.jobsService.analyzeRawJD(this.rawJdInput).subscribe({
      next: (res) => {
        this.isAnalyzing.set(false);
        if (res.success && res.data) {
          const d = res.data;
          this.newJob.title = d.roleTitle || this.newJob.title;
          this.newJob.department = d.department || this.newJob.department;
          this.newJob.description = d.summary || this.newJob.description;
          this.extractedSkills.set(d.requiredSkills || []);
          this.newJob.requiredSkills = d.requiredSkills || [];
        }
      },
      error: () => {
        this.isAnalyzing.set(false);
      }
    });
  }

  submitJob(): void {
    this.isSubmitting.set(true);
    this.jobsService.create(this.newJob).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadJobs();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
