import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="brand-header">
          <div class="brand-icon">
            <span class="material-icons-outlined">psychology</span>
          </div>
          <h1>TalentMind AI</h1>
          <p class="subtitle">Enterprise AI Screening, Interview & Assessment Platform</p>
        </div>

        <div class="demo-buttons">
          <div class="demo-label">ONE-CLICK DEMO LOGIN</div>
          <div class="demo-btn-group">
            <button type="button" class="btn-demo" (click)="fillAndSubmit('admin@acme-tech.example.com', 'Admin@123456')">
              <span class="material-icons-outlined">admin_panel_settings</span>
              <span>Admin Demo</span>
            </button>
            <button type="button" class="btn-demo" (click)="fillAndSubmit('recruiter@acme-tech.example.com', 'Admin@123456')">
              <span class="material-icons-outlined">badge</span>
              <span>Recruiter Demo</span>
            </button>
          </div>
        </div>

        <div class="divider">
          <span>OR SIGN IN MANUALLY</span>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div *ngIf="errorMessage()" class="alert-error">
            <span class="material-icons-outlined">error_outline</span>
            <span>{{ errorMessage() }}</span>
          </div>

          <div class="form-group">
            <label for="email">Work Email</label>
            <div class="input-with-icon">
              <span class="material-icons-outlined">mail_outline</span>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <span class="material-icons-outlined">lock_outline</span>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" [disabled]="loading()" class="btn-submit">
            <span *ngIf="!loading()">Sign In to Workspace</span>
            <span *ngIf="loading()">Authenticating...</span>
          </button>
        </form>

        <div class="candidate-direct">
          <span>Are you a candidate? Access your interview via your personal link:</span>
          <a routerLink="/candidate/interview/priya-demo-active-invite-2026" class="candidate-link">
            Launch Candidate Interview Portal (Priya Sharma Demo) &rarr;
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      padding: 24px;
    }

    .login-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 28px;

      .brand-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #4f46e5, #8b5cf6);
        color: #ffffff;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        span {
          font-size: 32px;
        }
      }

      h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 6px;
      }

      .subtitle {
        font-size: 0.875rem;
        color: #64748b;
      }
    }

    .demo-buttons {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;

      .demo-label {
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 10px;
        text-align: center;
      }

      .demo-btn-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;

        .btn-demo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: #334155;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: all 0.15s ease;

          &:hover {
            border-color: #4f46e5;
            color: #4f46e5;
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
          }

          span {
            font-size: 18px;
          }
        }
      }
    }

    .divider {
      position: relative;
      text-align: center;
      margin-bottom: 24px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e2e8f0;
      }

      span {
        position: relative;
        background: #ffffff;
        padding: 0 12px;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.05em;
      }
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 10px 14px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      margin-bottom: 16px;
    }

    .form-group {
      margin-bottom: 18px;

      label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #334155;
        margin-bottom: 6px;
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;

        span {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          font-size: 20px;
        }

        input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease;

          &:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }
        }
      }
    }

    .btn-submit {
      width: 100%;
      padding: 12px;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover:not(:disabled) {
        background: #4338ca;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .candidate-direct {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 0.75rem;
      color: #64748b;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .candidate-link {
        color: #4f46e5;
        font-weight: 600;
        text-decoration: underline;

        &:hover {
          color: #3730a3;
        }
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  fillAndSubmit(e: string, p: string): void {
    this.email = e;
    this.password = p;
    this.onSubmit();
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please provide both email and password');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error?.message || 'Authentication failed. Please verify credentials.');
      }
    });
  }
}
