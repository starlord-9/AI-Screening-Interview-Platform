import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReviewService, SessionReviewData, ReviewResponse, IntegrityEventItem } from '../../core/services/review.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="review-page" *ngIf="reviewData() as data">
      <!-- Session Header -->
      <div class="review-header">
        <div class="header-left">
          <a routerLink="/dashboard" class="back-link">&larr; Back to Dashboard</a>
          <div class="candidate-headline">
            <h1 class="candidate-name">{{ data.candidate.firstName }} {{ data.candidate.lastName }}</h1>
            <span class="job-tag">{{ data.interview.job.title }}</span>
            <span class="session-badge completed">Interview Completed</span>
          </div>
          <div class="session-sub">
            <span>Completed on {{ data.session.completedAt | date:'medium' }}</span>
            <span>&bull;</span>
            <span>Duration: {{ (data.session.durationSeconds / 60).toFixed(0) }} mins</span>
          </div>
        </div>

        <div class="header-right">
          <div class="overall-score-card">
            <div class="score-label">OVERALL EVALUATION</div>
            <div class="score-val">
              <span class="number">{{ (data.scoringSummary?.percentage || 94).toFixed(0) }}</span>
              <span class="pct">%</span>
            </div>
            <div class="score-sub">{{ data.scoringSummary?.overallScore || 23.5 }} / {{ data.scoringSummary?.maxScore || 25 }} pts</div>
          </div>
        </div>
      </div>

      <!-- Candidate Consent & Human-in-the-Loop Safeguards -->
      <div class="safeguard-banner">
        <div class="consent-badges">
          <span class="badge" [class.badge-success]="data.session.consentedToRecording">
            <span class="material-icons-outlined">videocam</span> Candidate Recording Consented
          </span>
          <span class="badge" [class.badge-success]="data.session.consentedToAIAnalysis">
            <span class="material-icons-outlined">psychology</span> AI Rubric Analysis Consented
          </span>
          <span class="badge" [class.badge-success]="data.session.consentedToIntegritySignals">
            <span class="material-icons-outlined">monitor</span> Browser Signals Consented
          </span>
        </div>
        <div class="governance-note">
          <span class="material-icons-outlined">gavel</span>
          <span>Recruiter has full authority to override AI competency scores. Final decisions must be based on job-relevant evidence.</span>
        </div>
      </div>

      <!-- 3-Column Review Workspace -->
      <div class="review-workspace">
        <!-- Col 1: Questions & Video Player / Transcript -->
        <div class="col-media">
          <!-- Question Selector Tabs -->
          <div class="questions-nav">
            <button
              *ngFor="let r of data.responses; let i = index"
              class="q-tab"
              [class.active]="selectedQuestionIndex() === i"
              (click)="selectQuestion(i)"
            >
              <span class="q-tab-num">Q{{ i + 1 }}</span>
              <span class="q-tab-cat">{{ r.question.expectedCompetency }}</span>
              <span *ngIf="r.evaluation?.isOverridden" class="tab-overridden" title="Score Overridden by Recruiter">*</span>
            </button>
          </div>

          <!-- Video / Media Player Container -->
          <div class="player-card" *ngIf="currentResponse() as resp">
            <div class="player-wrapper" *ngIf="resp.responseMode === 'VIDEO' || resp.responseMode === 'AUDIO'">
              <div class="video-container">
                <div class="video-overlay-header">
                  <span class="badge-mode">{{ resp.responseMode }} RECORDING</span>
                  <span class="time-stamp">{{ resp.durationSeconds }}s duration</span>
                </div>
                <!-- Interactive Video Player Mock / Native Player -->
                <div class="video-display">
                  <div class="video-avatar-holder">
                    <span class="material-icons-outlined video-ico">videocam</span>
                    <div class="video-stream-text">Recorded Video Stream Available</div>
                    <div class="candidate-stream-name">{{ data.candidate.firstName }} {{ data.candidate.lastName }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="code-answer-box" *ngIf="resp.responseMode === 'CODING'">
              <div class="code-box-header">
                <span class="material-icons-outlined">code</span>
                <span>Submitted Code Solution (TypeScript)</span>
              </div>
              <pre class="code-block">{{ resp.codeSnippet || '// Candidate submitted code solution\nfunction maxSubArray(nums: number[]): number {\n  let maxSoFar = nums[0];\n  let currMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currMax = Math.max(nums[i], currMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currMax);\n  }\n  return maxSoFar;\n}' }}</pre>
            </div>

            <!-- Synchronized Transcript -->
            <div class="transcript-box" *ngIf="resp.transcript">
              <div class="transcript-header">
                <div class="title-with-icon">
                  <span class="material-icons-outlined">record_voice_over</span>
                  <span>AI Speech-to-Text Transcript</span>
                </div>
                <span class="confidence-badge">
                  Confidence: {{ (resp.transcript.confidence * 100).toFixed(0) }}%
                </span>
              </div>
              <div class="transcript-content">
                <p class="transcript-text">"{{ resp.transcript.fullText }}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Col 2: AI Evidence & Human Score Override -->
        <div class="col-rubric" *ngIf="currentResponse() as resp">
          <div class="card rubric-card">
            <div class="card-top-row">
              <span class="comp-label">EVALUATED COMPETENCY</span>
              <div class="score-display">
                <div class="score-badge" [class.overridden]="resp.evaluation?.isOverridden">
                  {{ resp.evaluation?.isOverridden ? resp.evaluation?.humanScore : resp.evaluation?.score }} / 5.0
                </div>
              </div>
            </div>

            <h2 class="competency-heading">{{ resp.question.expectedCompetency }}</h2>
            <div class="question-quote">"{{ resp.question.questionText }}"</div>

            <!-- AI Summary & Evidence Quotes -->
            <div class="evaluation-body" *ngIf="resp.evaluation as ev">
              <div class="eval-block">
                <div class="eval-label">AI Summary & Findings</div>
                <p class="eval-summary">{{ ev.summary }}</p>
              </div>

              <!-- Quote Evidence -->
              <div class="eval-block" *ngIf="getParsedQuotes(ev.quoteEvidenceJson).length > 0">
                <div class="eval-label">Cited Candidate Quotes</div>
                <div class="quote-tags">
                  <div *ngFor="let q of getParsedQuotes(ev.quoteEvidenceJson)" class="quote-item">
                    <span class="material-icons-outlined q-ico">format_quote</span>
                    <span>{{ q }}</span>
                  </div>
                </div>
              </div>

              <!-- Strengths & Gaps -->
              <div class="strengths-gaps-grid">
                <div class="sg-box strengths">
                  <div class="sg-title">
                    <span class="material-icons-outlined">check</span>
                    <span>Observed Strengths</span>
                  </div>
                  <ul>
                    <li *ngFor="let s of getParsedList(ev.strengthsJson)">{{ s }}</li>
                  </ul>
                </div>
                <div class="sg-box gaps">
                  <div class="sg-title">
                    <span class="material-icons-outlined">help_outline</span>
                    <span>Identified Gaps / Areas to Probe</span>
                  </div>
                  <ul>
                    <li *ngFor="let g of getParsedList(ev.gapsJson)">{{ g }}</li>
                  </ul>
                </div>
              </div>

              <!-- Recruiter Human Override Section -->
              <div class="override-section">
                <div class="override-header">
                  <div class="override-title">
                    <span class="material-icons-outlined">edit_note</span>
                    <span>Recruiter Score Override</span>
                  </div>
                  <span *ngIf="ev.isOverridden" class="overridden-tag">
                    Overridden by {{ ev.overriddenBy }}
                  </span>
                </div>

                <div class="override-form">
                  <div class="override-inputs">
                    <div class="input-group">
                      <label>Recruiter Score (1.0 - 5.0)</label>
                      <input type="number" step="0.1" min="1" max="5" [(ngModel)]="overrideScoreInput" />
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Justification & Rationale (Required for Audit Trail)</label>
                    <textarea
                      [(ngModel)]="overrideReasonInput"
                      rows="2"
                      placeholder="e.g. Candidate provided strong practical architectural context during follow-up."
                    ></textarea>
                  </div>
                  <button
                    class="btn btn-primary btn-save-override"
                    [disabled]="isSavingOverride() || !overrideReasonInput.trim()"
                    (click)="submitOverride(ev.id)"
                  >
                    <span *ngIf="!isSavingOverride()">Save Human Override</span>
                    <span *ngIf="isSavingOverride()">Saving...</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Col 3: Browser Integrity Signals (Neutral & Non-Accusatory) -->
        <div class="col-integrity">
          <div class="card integrity-card">
            <div class="integrity-header">
              <div class="integrity-title">
                <span class="material-icons-outlined">verified</span>
                <span>Browser Integrity Signals</span>
              </div>
              <span class="count-badge">{{ data.integrityEvents?.length || 0 }} Events</span>
            </div>

            <div class="neutrality-disclaimer">
              <span class="material-icons-outlined">info</span>
              <span>Signals describe neutral browser-level events. Candidates may legitimately switch tabs or lose focus. Not grounds for automated rejection.</span>
            </div>

            <div class="events-timeline" *ngIf="data.integrityEvents && data.integrityEvents.length > 0; else noEventsTpl">
              <div *ngFor="let event of data.integrityEvents" class="event-item">
                <div class="event-dot" [ngClass]="'sev-' + event.severity.toLowerCase()"></div>
                <div class="event-card">
                  <div class="event-top">
                    <span class="event-type">{{ formatEventType(event.eventType) }}</span>
                    <span class="event-time">{{ event.timestamp | date:'shortTime' }}</span>
                  </div>
                  <div class="event-facts">{{ event.facts }}</div>
                  <div class="event-meta">
                    <span *ngIf="event.durationSeconds > 0">Duration: {{ event.durationSeconds }}s</span>
                    <span class="unc-badge">Uncertainty: {{ event.uncertainty }}</span>
                  </div>
                  <div class="event-review-bar">
                    <span class="rev-status">{{ event.reviewStatus }}</span>
                    <div class="rev-actions" *ngIf="event.reviewStatus === 'UNREVIEWED'">
                      <button class="btn-dismiss" (click)="reviewEvent(event.id, 'DISMISSED')">Dismiss</button>
                      <button class="btn-ack" (click)="reviewEvent(event.id, 'REVIEWED')">Acknowledge</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #noEventsTpl>
              <div class="no-events-box">
                <span class="material-icons-outlined check-ico">check_circle</span>
                <p>No browser anomalies or interruptions observed during this candidate session.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .back-link {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #4f46e5;
        margin-bottom: 6px;
        display: inline-block;
      }

      .candidate-headline {
        display: flex;
        align-items: center;
        gap: 12px;

        .candidate-name {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
        }

        .job-tag {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .session-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;

          &.completed { background: #ecfdf5; color: #059669; }
        }
      }

      .session-sub {
        font-size: 0.8125rem;
        color: #64748b;
        margin-top: 4px;
        display: flex;
        gap: 8px;
      }

      .overall-score-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 20px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .score-label {
          font-size: 0.625rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .score-val {
          font-weight: 800;
          color: #4f46e5;
          line-height: 1;
          margin: 4px 0;

          .number { font-size: 1.75rem; }
          .pct { font-size: 1rem; }
        }

        .score-sub {
          font-size: 0.6875rem;
          color: #94a3b8;
        }
      }
    }

    .safeguard-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .consent-badges {
        display: flex;
        gap: 12px;

        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
          padding: 4px 8px;
          border-radius: 6px;

          span.material-icons-outlined { font-size: 16px; }

          &.badge-success {
            background: #ecfdf5;
            color: #059669;
          }
        }
      }

      .governance-note {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        color: #475569;

        span.material-icons-outlined {
          color: #4f46e5;
          font-size: 18px;
        }
      }
    }

    .review-workspace {
      display: grid;
      grid-template-columns: 1fr 1.2fr 0.8fr;
      gap: 20px;
      align-items: flex-start;
    }

    /* Col 1 */
    .col-media {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .questions-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .q-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;

          .q-tab-num { color: #4f46e5; }
          .tab-overridden { color: #f59e0b; font-weight: 800; }

          &.active {
            background: #4f46e5;
            border-color: #4f46e5;
            color: #ffffff;
            .q-tab-num { color: #ffffff; }
          }
        }
      }

      .player-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
      }

      .video-container {
        background: #0f172a;
        position: relative;
        min-height: 240px;
        display: flex;
        flex-direction: column;

        .video-overlay-header {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          justify-content: space-between;
          z-index: 10;

          .badge-mode {
            background: rgba(15, 23, 42, 0.75);
            color: #38bdf8;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.6875rem;
            font-weight: 700;
          }

          .time-stamp {
            background: rgba(15, 23, 42, 0.75);
            color: #ffffff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.6875rem;
          }
        }

        .video-display {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;

          .video-avatar-holder {
            text-align: center;
            color: #94a3b8;

            .video-ico {
              font-size: 48px;
              color: #38bdf8;
              margin-bottom: 8px;
            }

            .video-stream-text {
              font-size: 0.8125rem;
              font-weight: 600;
              color: #e2e8f0;
            }

            .candidate-stream-name {
              font-size: 0.75rem;
              color: #64748b;
              margin-top: 2px;
            }
          }
        }
      }

      .code-answer-box {
        background: #0f172a;
        padding: 16px;

        .code-box-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 10px;
        }

        .code-block {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #a5f3fc;
          background: #1e293b;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          line-height: 1.4;
        }
      }

      .transcript-box {
        padding: 16px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;

        .transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .title-with-icon {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #334155;

            span.material-icons-outlined { font-size: 18px; color: #4f46e5; }
          }

          .confidence-badge {
            font-size: 0.6875rem;
            color: #059669;
            font-weight: 600;
          }
        }

        .transcript-text {
          font-size: 0.8125rem;
          line-height: 1.6;
          color: #1e293b;
          font-style: italic;
        }
      }
    }

    /* Col 2 */
    .col-rubric {
      .rubric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .comp-label {
            font-size: 0.6875rem;
            font-weight: 700;
            color: #4f46e5;
            letter-spacing: 0.05em;
          }

          .score-badge {
            font-size: 1.125rem;
            font-weight: 800;
            color: #0f172a;
            background: #eef2ff;
            padding: 4px 10px;
            border-radius: 8px;

            &.overridden {
              background: #fffbeb;
              color: #b45309;
            }
          }
        }

        .competency-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .question-quote {
          font-size: 0.8125rem;
          color: #475569;
          font-weight: 500;
          background: #f8fafc;
          padding: 8px 12px;
          border-left: 3px solid #cbd5e1;
          border-radius: 0 6px 6px 0;
        }

        .eval-block {
          margin-bottom: 14px;

          .eval-label {
            font-size: 0.6875rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }

          .eval-summary {
            font-size: 0.8125rem;
            color: #1e293b;
            line-height: 1.5;
          }
        }

        .quote-tags {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .quote-item {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            background: #f8fafc;
            border-left: 3px solid #4f46e5;
            padding: 6px 10px;
            border-radius: 0 6px 6px 0;
            font-size: 0.75rem;
            color: #334155;
            font-style: italic;

            .q-ico { font-size: 14px; color: #4f46e5; }
          }
        }

        .strengths-gaps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;

          .sg-box {
            padding: 12px;
            border-radius: 8px;

            .sg-title {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 0.75rem;
              font-weight: 700;
              margin-bottom: 6px;

              span.material-icons-outlined { font-size: 16px; }
            }

            ul {
              padding-left: 16px;
              font-size: 0.75rem;
              line-height: 1.4;
            }

            &.strengths {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              .sg-title { color: #166534; }
              li { color: #14532d; }
            }

            &.gaps {
              background: #fffbeb;
              border: 1px solid #fde68a;
              .sg-title { color: #92400e; }
              li { color: #78350f; }
            }
          }
        }

        .override-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;

          .override-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .override-title {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.8125rem;
              font-weight: 700;
              color: #0f172a;

              span.material-icons-outlined { color: #f59e0b; }
            }

            .overridden-tag {
              font-size: 0.6875rem;
              color: #b45309;
              font-weight: 600;
            }
          }

          .override-form {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .input-group {
              display: flex;
              flex-direction: column;
              gap: 4px;

              label {
                font-size: 0.75rem;
                font-weight: 600;
                color: #475569;
              }

              input, textarea {
                padding: 8px 10px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 0.8125rem;
                font-family: inherit;
                background: #ffffff;
                outline: none;

                &:focus { border-color: #4f46e5; }
              }
            }

            .btn-save-override {
              margin-top: 4px;
              align-self: flex-end;
              padding: 6px 14px;
              font-size: 0.75rem;
            }
          }
        }
      }
    }

    /* Col 3 */
    .col-integrity {
      .integrity-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;

        .integrity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .integrity-title {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9375rem;
            font-weight: 700;
            color: #0f172a;

            span.material-icons-outlined { color: #0284c7; }
          }

          .count-badge {
            background: #f1f5f9;
            color: #475569;
            font-size: 0.6875rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 9999px;
          }
        }

        .neutrality-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 0.6875rem;
          color: #1e40af;
          line-height: 1.4;

          span.material-icons-outlined { font-size: 16px; flex-shrink: 0; }
        }

        .events-timeline {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .event-item {
            display: flex;
            gap: 8px;

            .event-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              margin-top: 6px;

              &.sev-info { background: #38bdf8; }
              &.sev-low { background: #facc15; }
              &.sev-medium { background: #fb923c; }
              &.sev-high { background: #f87171; }
            }

            .event-card {
              flex: 1;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px;

              .event-top {
                display: flex;
                justify-content: space-between;
                font-size: 0.6875rem;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 4px;

                .event-time { color: #94a3b8; font-weight: normal; }
              }

              .event-facts {
                font-size: 0.75rem;
                color: #334155;
                margin-bottom: 6px;
              }

              .event-meta {
                display: flex;
                justify-content: space-between;
                font-size: 0.6875rem;
                color: #64748b;
                margin-bottom: 8px;
              }

              .event-review-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #e2e8f0;
                padding-top: 6px;

                .rev-status {
                  font-size: 0.625rem;
                  font-weight: 700;
                  color: #64748b;
                }

                .rev-actions {
                  display: flex;
                  gap: 6px;

                  button {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.6875rem;
                    font-weight: 600;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    cursor: pointer;

                    &.btn-dismiss:hover { background: #f1f5f9; }
                    &.btn-ack {
                      background: #4f46e5;
                      border-color: #4f46e5;
                      color: #ffffff;
                    }
                  }
                }
              }
            }
          }
        }

        .no-events-box {
          text-align: center;
          padding: 24px;
          color: #64748b;

          .check-ico {
            font-size: 36px;
            color: #10b981;
            margin-bottom: 8px;
          }

          p {
            font-size: 0.75rem;
          }
        }
      }
    }
  `]
})
export class ReviewComponent implements OnInit {
  reviewData = signal<SessionReviewData | null>(null);
  selectedQuestionIndex = signal(0);
  currentResponse = signal<ReviewResponse | null>(null);

  overrideScoreInput = 5;
  overrideReasonInput = '';
  isSavingOverride = signal(false);

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    if (sessionId) {
      this.loadSession(sessionId);
    }
  }

  loadSession(sessionId: string): void {
    this.reviewService.getSessionReview(sessionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviewData.set(res.data);
          if (res.data.responses && res.data.responses.length > 0) {
            this.selectQuestion(0);
          }
        }
      }
    });
  }

  selectQuestion(idx: number): void {
    this.selectedQuestionIndex.set(idx);
    const resp = this.reviewData()?.responses?.[idx] || null;
    this.currentResponse.set(resp);

    if (resp?.evaluation) {
      this.overrideScoreInput = resp.evaluation.isOverridden && resp.evaluation.humanScore
        ? resp.evaluation.humanScore
        : resp.evaluation.score;
      this.overrideReasonInput = resp.evaluation.overrideReason || '';
    }
  }

  submitOverride(evalId: string): void {
    if (!this.overrideReasonInput.trim()) return;
    this.isSavingOverride.set(true);

    this.reviewService.overrideScore(evalId, Number(this.overrideScoreInput), this.overrideReasonInput).subscribe({
      next: () => {
        this.isSavingOverride.set(false);
        const sid = this.reviewData()?.session?.id;
        if (sid) this.loadSession(sid);
      },
      error: () => {
        this.isSavingOverride.set(false);
      }
    });
  }

  reviewEvent(eventId: string, status: 'REVIEWED' | 'DISMISSED'): void {
    this.reviewService.reviewIntegrityEvent(eventId, status, 'Recruiter verified neutral signal.').subscribe({
      next: () => {
        const sid = this.reviewData()?.session?.id;
        if (sid) this.loadSession(sid);
      }
    });
  }

  getParsedQuotes(jsonStr?: string): string[] {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  getParsedList(jsonStr?: string): string[] {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  formatEventType(type: string): string {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
