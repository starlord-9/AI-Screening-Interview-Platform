import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService, AssistantMessage } from '../../core/services/assistant.service';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assistant-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">TalentMind AI Recruiter Copilot</h1>
          <p class="page-desc">Grounded semantic search, transcript interrogation, and candidate comparison</p>
        </div>
        <div class="badge-grounded">
          <span class="material-icons-outlined">verified</span>
          <span>Strictly Grounded in Verified Transcripts & Resumes</span>
        </div>
      </div>

      <div class="chat-container">
        <!-- Messages Area -->
        <div class="messages-area">
          <div *ngFor="let msg of messages()" class="message-row" [ngClass]="'msg-' + msg.role">
            <div class="message-avatar">
              <span class="material-icons-outlined" *ngIf="msg.role === 'assistant'">psychology</span>
              <span class="material-icons-outlined" *ngIf="msg.role === 'user'">person</span>
            </div>
            <div class="message-bubble">
              <div class="message-text">{{ msg.content }}</div>

              <!-- Citations -->
              <div *ngIf="msg.citations && msg.citations.length > 0" class="citations-box">
                <div class="citations-title">
                  <span class="material-icons-outlined">format_quote</span>
                  <span>Verified Citations & Grounding Evidence</span>
                </div>
                <div class="citations-list">
                  <div *ngFor="let c of msg.citations" class="citation-pill">
                    <span class="citation-src">{{ c.source }}</span>
                    <span class="citation-quote">"{{ c.quote }}"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="isThinking()" class="message-row msg-assistant">
            <div class="message-avatar">
              <span class="material-icons-outlined">psychology</span>
            </div>
            <div class="message-bubble thinking-bubble">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Quick Prompts Suggestions -->
        <div class="quick-prompts-bar">
          <div class="qp-label">SUGGESTED QUERIES:</div>
          <button
            *ngFor="let prompt of suggestedPrompts"
            class="btn-qp"
            (click)="selectPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-input-area">
          <textarea
            [(ngModel)]="userInput"
            (keydown.enter)="$event.preventDefault(); onSend()"
            placeholder="Ask anything about candidate answers, coding solutions, or competency evidence..."
            rows="2"
          ></textarea>
          <button class="btn-send" [disabled]="isThinking() || !userInput.trim()" (click)="onSend()">
            <span class="material-icons-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assistant-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: calc(100vh - 124px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

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

      .badge-grounded {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #047857;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
    }

    .chat-container {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .message-row {
      display: flex;
      gap: 12px;
      max-width: 80%;

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        span { font-size: 20px; }
      }

      .message-bubble {
        padding: 14px 18px;
        border-radius: 12px;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      &.msg-assistant {
        align-self: flex-start;
        .message-avatar { background: #eef2ff; color: #4f46e5; }
        .message-bubble { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; }
      }

      &.msg-user {
        align-self: flex-end;
        flex-direction: row-reverse;
        .message-avatar { background: #4f46e5; color: #ffffff; }
        .message-bubble { background: #4f46e5; color: #ffffff; }
      }
    }

    .citations-box {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;

      .citations-title {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #4f46e5;
        margin-bottom: 6px;
        span.material-icons-outlined { font-size: 14px; }
      }

      .citations-list {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .citation-pill {
          background: #ffffff;
          border-left: 3px solid #4f46e5;
          padding: 6px 8px;
          border-radius: 0 4px 4px 0;
          font-size: 0.75rem;

          .citation-src {
            font-weight: 700;
            color: #334155;
            display: block;
            font-size: 0.6875rem;
          }

          .citation-quote {
            color: #64748b;
            font-style: italic;
          }
        }
      }
    }

    .thinking-bubble {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 18px !important;

      .dot {
        width: 8px;
        height: 8px;
        background: #94a3b8;
        border-radius: 50%;
        animation: pulse 1s infinite alternate;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes pulse {
      0% { opacity: 0.3; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1.2); }
    }

    .quick-prompts-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      overflow-x: auto;

      .qp-label {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #64748b;
        white-space: nowrap;
      }

      .btn-qp {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        color: #334155;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }
      }
    }

    .chat-input-area {
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      align-items: center;

      textarea {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.875rem;
        resize: none;
        outline: none;

        &:focus {
          border-color: #4f46e5;
        }
      }

      .btn-send {
        width: 44px;
        height: 44px;
        background: #4f46e5;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #4338ca;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class AssistantComponent implements OnInit {
  messages = signal<AssistantMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your TalentMind AI Recruiter Copilot. I can search candidate responses, analyze coding submissions, and summarize interview transcripts with grounded citations. How can I assist your review today?',
      timestamp: new Date()
    }
  ]);

  userInput = '';
  isThinking = signal(false);

  suggestedPrompts = [
    "Summarize Alex Rivera's answers for Senior Full Stack Engineer",
    'Did Alex Rivera explain Angular Signals properly?',
    'What were the strengths and gaps in the Kadane coding solution?',
    'Compare candidate performance against the microservices competency'
  ];

  constructor(private assistantService: AssistantService) {}

  ngOnInit(): void {}

  selectPrompt(p: string): void {
    this.userInput = p;
    this.onSend();
  }

  onSend(): void {
    if (!this.userInput.trim() || this.isThinking()) return;

    const query = this.userInput.trim();
    this.messages.update((msgs) => [
      ...msgs,
      { role: 'user', content: query, timestamp: new Date() }
    ]);
    this.userInput = '';
    this.isThinking.set(true);

    this.assistantService.ask(query).subscribe({
      next: (res) => {
        this.isThinking.set(false);
        if (res.success && res.data) {
          this.messages.update((msgs) => [
            ...msgs,
            {
              role: 'assistant',
              content: res.data.answer,
              citations: res.data.citations,
              timestamp: new Date()
            }
          ]);
        }
      },
      error: () => {
        this.isThinking.set(false);
        this.messages.update((msgs) => [
          ...msgs,
          {
            role: 'assistant',
            content: 'I encountered an error retrieving grounded citations. Please verify server connection.',
            timestamp: new Date()
          }
        ]);
      }
    });
  }
}
