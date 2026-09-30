import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CandidatesService, Candidate } from '../../core/services/candidates.service';

interface PipelineColumn {
  id: string;
  title: string;
  candidates: Candidate[];
}

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pipeline-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Candidate Pipeline Kanban</h1>
          <p class="page-desc">Visual stage progression with complete human decision authority</p>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board">
        <div *ngFor="let col of columns()" class="kanban-col">
          <div class="col-header">
            <span class="col-title">{{ col.title }}</span>
            <span class="col-count">{{ col.candidates.length }}</span>
          </div>

          <div class="cards-wrap">
            <div *ngFor="let c of col.candidates" class="kanban-card">
              <div class="card-top">
                <div class="candidate-avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>
                <div class="candidate-info">
                  <div class="candidate-name">{{ c.firstName }} {{ c.lastName }}</div>
                  <div class="candidate-role">{{ c.candidateJobs?.[0]?.job?.title || 'Senior Full Stack' }}</div>
                </div>
              </div>

              <div class="card-meta">
                <span class="match-score">Match: {{ c.candidateJobs?.[0]?.matchScore || 88 }}%</span>
                <span *ngIf="c.invitations?.[0]?.sessions?.[0]?.id" class="badge-done">Interview Done</span>
              </div>

              <div class="card-actions">
                <a *ngIf="c.invitations?.[0]?.sessions?.[0]?.id" [routerLink]="['/review', c.invitations[0].sessions[0].id]" class="btn-review">
                  Review &rarr;
                </a>
                <div class="move-dropdown">
                  <select (change)="moveStage(c.id, $event)">
                    <option value="" disabled selected>Move to...</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                    <option value="TECHNICAL_REVIEW">Technical Review</option>
                    <option value="FINAL_REVIEW">Final Review</option>
                    <option value="OFFER_EXTENDED">Offer Extended</option>
                    <option value="HIRED">Hired</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pipeline-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: 100%;
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

    .kanban-board {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 20px;
      min-height: 540px;
    }

    .kanban-col {
      flex: 0 0 280px;
      background: #f1f5f9;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 200px);

      .col-header {
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e2e8f0;

        .col-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .col-count {
          background: #e2e8f0;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
        }
      }

      .cards-wrap {
        padding: 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }
    }

    .kanban-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: all 0.15s ease;

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }

      .card-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .candidate-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #4f46e5;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .candidate-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
        }

        .candidate-role {
          font-size: 0.6875rem;
          color: #64748b;
        }
      }

      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 0.75rem;

        .match-score {
          font-weight: 600;
          color: #059669;
        }

        .badge-done {
          background: #ecfdf5;
          color: #059669;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.6875rem;
          font-weight: 700;
        }
      }

      .card-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px solid #f1f5f9;

        .btn-review {
          font-size: 0.75rem;
          font-weight: 700;
          color: #4f46e5;
          text-decoration: underline;
        }

        .move-dropdown select {
          padding: 4px 6px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.6875rem;
          background: #ffffff;
          outline: none;
        }
      }
    }
  `]
})
export class PipelineComponent implements OnInit {
  columns = signal<PipelineColumn[]>([
    { id: 'APPLIED', title: 'Applied', candidates: [] },
    { id: 'SCREENING', title: 'Screening', candidates: [] },
    { id: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', candidates: [] },
    { id: 'INTERVIEW_COMPLETED', title: 'Interview Completed', candidates: [] },
    { id: 'TECHNICAL_REVIEW', title: 'Technical Review', candidates: [] },
    { id: 'FINAL_REVIEW', title: 'Final Review', candidates: [] },
    { id: 'HIRED', title: 'Hired', candidates: [] }
  ]);

  constructor(private candidatesService: CandidatesService) {}

  ngOnInit(): void {
    this.loadPipeline();
  }

  loadPipeline(): void {
    this.candidatesService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          const all = res.data;
          this.columns.update((cols) =>
            cols.map((col) => ({
              ...col,
              candidates: all.filter((c) => c.stage === col.id)
            }))
          );
        }
      }
    });
  }

  moveStage(candidateId: string, event: any): void {
    const newStage = event.target.value;
    if (!newStage) return;

    this.candidatesService.updateStage(candidateId, newStage).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadPipeline();
        }
      }
    });
  }
}
