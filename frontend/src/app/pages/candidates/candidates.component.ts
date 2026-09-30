import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CandidatesService, Candidate } from '../../core/services/candidates.service';
import { JobsService, Job } from '../../core/services/jobs.service';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="candidates-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Candidate Directory & Evidence Matching</h1>
          <p class="page-desc">Review resume-to-requirement evidence, stage progressions, and interview signals</p>
        </div>
        <button class="btn btn-primary" (click)="openAddCandidateModal()">
          <span class="material-icons-outlined">person_add</span>
          <span>Add Candidate</span>
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="filter-bar">
        <div class="search-box">
          <span class="material-icons-outlined">search</span>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Filter by candidate name, skill, or email..." />
        </div>
        <div class="stage-filter">
          <select [(ngModel)]="selectedStageFilter">
            <option value="">All Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="TECHNICAL_REVIEW">Technical Review</option>
            <option value="FINAL_REVIEW">Final Review</option>
          </select>
        </div>
      </div>

      <!-- Candidate Grid -->
      <div class="candidates-layout">
        <!-- List Table -->
        <div class="candidate-list-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target Job</th>
                <th>Match Score</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCandidates()" [class.selected]="selectedCandidate()?.id === c.id" (click)="selectCandidate(c)">
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
                  <span class="job-title">{{ c.candidateJobs?.[0]?.job?.title || 'Senior Full Stack Engineer' }}</span>
                </td>
                <td>
                  <div class="score-pill" [ngClass]="getScoreClass(c.candidateJobs?.[0]?.matchScore || 85)">
                    {{ c.candidateJobs?.[0]?.matchScore || 85 }}%
                  </div>
                </td>
                <td>
                  <span class="stage-badge" [ngClass]="'stage-' + c.stage.toLowerCase()">
                    {{ formatStage(c.stage) }}
                  </span>
                </td>
                <td>
                  <button class="btn-select" (click)="$event.stopPropagation(); selectCandidate(c)">
                    <span>Details</span>
                    <span class="material-icons-outlined">chevron_right</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Detail Side Panel -->
        <div *ngIf="selectedCandidate() as candidate" class="candidate-detail-panel">
          <div class="panel-header">
            <div class="header-user">
              <div class="avatar-lg">{{ candidate.firstName[0] }}{{ candidate.lastName[0] }}</div>
              <div>
                <h2>{{ candidate.firstName }} {{ candidate.lastName }}</h2>
                <div class="email-text">{{ candidate.email }} &bull; {{ candidate.phone || '+1 555-0192' }}</div>
              </div>
            </div>
            <button class="btn-close" (click)="selectedCandidate.set(null)">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <!-- Stage Management & Human Decision Bar -->
          <div class="stage-control-card">
            <div class="control-label">HUMAN DECISION WORKFLOW</div>
            <div class="stage-selector-wrap">
              <select [(ngModel)]="stageToChange">
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                <option value="TECHNICAL_REVIEW">Technical Review</option>
                <option value="FINAL_REVIEW">Final Review</option>
                <option value="OFFER_EXTENDED">Offer Extended</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button class="btn btn-primary" (click)="updateCandidateStage(candidate.id)">
                Update Stage
              </button>
            </div>
          </div>

          <!-- Interview Session Link (if completed or active) -->
          <div *ngIf="candidate.invitations?.[0]?.sessions?.[0]?.id" class="review-alert">
            <div class="review-icon">
              <span class="material-icons-outlined">play_circle</span>
            </div>
            <div class="review-info">
              <div class="review-title">AI Interview Session Completed</div>
              <div class="review-sub">Responses, video transcripts, and AI rubric are available for review.</div>
              <a [routerLink]="['/review', candidate.invitations[0].sessions[0].id]" class="btn-go-review">
                Open Review Workspace &rarr;
              </a>
            </div>
          </div>

          <!-- Mapped Evidence Matrix -->
          <div class="evidence-section">
            <div class="section-title">
              <span class="material-icons-outlined">fact_check</span>
              <span>Resume Evidence vs Job Requirements</span>
            </div>

            <div *ngIf="evidenceList().length > 0; else noEvidenceTpl" class="evidence-list">
              <div *ngFor="let ev of evidenceList()" class="evidence-card">
                <div class="ev-top">
                  <span class="ev-cat">{{ ev.jobRequirement?.category || 'CORE REQUIREMENT' }}</span>
                  <span class="ev-match" [ngClass]="'match-' + ev.matchLevel.toLowerCase()">
                    {{ ev.matchLevel }} ({{ (ev.confidenceScore * 100).toFixed(0) }}%)
                  </span>
                </div>
                <div class="ev-req-text">{{ ev.jobRequirement?.text }}</div>
                <div class="ev-quote-box">
                  <span class="quote-icon">“</span>
                  <span class="quote-text">{{ ev.quote }}</span>
                </div>
                <div *ngIf="ev.gapAnalysis" class="ev-gap">
                  <strong>Analysis:</strong> {{ ev.gapAnalysis }}
                </div>
              </div>
            </div>

            <ng-template #noEvidenceTpl>
              <div class="empty-evidence">
                <p>Upload a PDF/DOCX resume to automatically match evidence against job requirements.</p>
                <label class="btn-upload-resume">
                  <input type="file" (change)="onUploadResume($event, candidate.id)" style="display:none;" />
                  <span class="material-icons-outlined">upload_file</span>
                  <span>Upload Candidate Resume</span>
                </label>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .candidates-page {
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

    .filter-bar {
      display: flex;
      gap: 16px;
      align-items: center;

      .search-box {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;

        span {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }

        input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          font-size: 0.875rem;
          outline: none;

          &:focus {
            border-color: #4f46e5;
          }
        }
      }

      .stage-filter select {
        padding: 10px 16px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #ffffff;
        font-size: 0.875rem;
        color: #334155;
        outline: none;
      }
    }

    .candidates-layout {
      display: grid;
      grid-template-columns: 1fr 480px;
      gap: 24px;
      align-items: flex-start;
    }

    .candidate-list-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: #f8fafc;
        text-align: left;
        padding: 12px 16px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
      }

      tr {
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover {
          background: #f8fafc;
        }

        &.selected {
          background: #eef2ff;
        }
      }

      td {
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .candidate-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .candidate-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #4f46e5;
          color: #ffffff;
          font-size: 0.8125rem;
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

      .score-pill {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.75rem;

        &.score-high { background: #ecfdf5; color: #059669; }
        &.score-med { background: #fffbeb; color: #d97706; }
      }

      .stage-badge {
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 9999px;

        &.stage-applied { background: #f1f5f9; color: #475569; }
        &.stage-screening { background: #eff6ff; color: #2563eb; }
        &.stage-interview_completed { background: #ecfdf5; color: #059669; }
      }

      .btn-select {
        display: flex;
        align-items: center;
        gap: 2px;
        background: none;
        border: none;
        color: #4f46e5;
        font-size: 0.8125rem;
        font-weight: 600;
      }
    }

    .candidate-detail-panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .header-user {
          display: flex;
          gap: 14px;
          align-items: center;

          .avatar-lg {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #4f46e5;
            color: #ffffff;
            font-size: 1.125rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          h2 {
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
          }

          .email-text {
            font-size: 0.75rem;
            color: #64748b;
            margin-top: 2px;
          }
        }

        .btn-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
      }
    }

    .stage-control-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;

      .control-label {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
      }

      .stage-selector-wrap {
        display: flex;
        gap: 8px;

        select {
          flex: 1;
          padding: 8px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.8125rem;
        }
      }
    }

    .review-alert {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 14px;
      display: flex;
      gap: 12px;

      .review-icon {
        color: #16a34a;
        span { font-size: 28px; }
      }

      .review-title {
        font-weight: 700;
        font-size: 0.875rem;
        color: #14532d;
      }

      .review-sub {
        font-size: 0.75rem;
        color: #166534;
        margin: 2px 0 8px;
      }

      .btn-go-review {
        color: #15803d;
        font-weight: 700;
        font-size: 0.8125rem;
        text-decoration: underline;
      }
    }

    .evidence-section {
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 12px;

        span.material-icons-outlined {
          color: #4f46e5;
          font-size: 20px;
        }
      }

      .evidence-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .evidence-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;

        .ev-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;

          .ev-cat {
            font-size: 0.6875rem;
            font-weight: 700;
            color: #64748b;
          }

          .ev-match {
            font-size: 0.6875rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;

            &.match-strong { background: #ecfdf5; color: #059669; }
            &.match-partial { background: #fffbeb; color: #d97706; }
          }
        }

        .ev-req-text {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .ev-quote-box {
          background: #ffffff;
          border-left: 3px solid #4f46e5;
          padding: 6px 10px;
          border-radius: 0 4px 4px 0;
          font-size: 0.75rem;
          color: #334155;
          font-style: italic;
          margin-bottom: 6px;
        }

        .ev-gap {
          font-size: 0.75rem;
          color: #64748b;
        }
      }

      .empty-evidence {
        text-align: center;
        padding: 24px;
        border: 2px dashed #e2e8f0;
        border-radius: 8px;

        p {
          font-size: 0.8125rem;
          color: #64748b;
          margin-bottom: 12px;
        }

        .btn-upload-resume {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #4f46e5;
          color: #ffffff;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
        }
      }
    }
  `]
})
export class CandidatesComponent implements OnInit {
  candidates = signal<Candidate[]>([]);
  selectedCandidate = signal<Candidate | null>(null);
  searchQuery = '';
  selectedStageFilter = '';
  stageToChange = 'SCREENING';

  evidenceList = signal<any[]>([]);

  constructor(private candidatesService: CandidatesService) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.candidatesService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.candidates.set(res.data);
          if (res.data.length > 0 && !this.selectedCandidate()) {
            this.selectCandidate(res.data[0]);
          }
        }
      }
    });
  }

  filteredCandidates(): Candidate[] {
    return this.candidates().filter((c) => {
      const matchSearch =
        !this.searchQuery ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchStage = !this.selectedStageFilter || c.stage === this.selectedStageFilter;

      return matchSearch && matchStage;
    });
  }

  selectCandidate(c: Candidate): void {
    this.candidatesService.getById(c.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedCandidate.set(res.data);
          this.stageToChange = res.data.stage;
          const ev = res.data.resumes?.[0]?.evidenceMatches || [];
          this.evidenceList.set(ev);
        }
      }
    });
  }

  updateCandidateStage(candidateId: string): void {
    this.candidatesService.updateStage(candidateId, this.stageToChange).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadCandidates();
        }
      }
    });
  }

  onUploadResume(event: any, candidateId: string): void {
    const file = event.target.files?.[0];
    if (file) {
      this.candidatesService.uploadResume(candidateId, file).subscribe({
        next: () => {
          this.loadCandidates();
        }
      });
    }
  }

  openAddCandidateModal(): void {
    // Open modal or create quick candidate
  }

  getScoreClass(score: number): string {
    return score >= 85 ? 'score-high' : 'score-med';
  }

  formatStage(stage: string): string {
    return stage
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
