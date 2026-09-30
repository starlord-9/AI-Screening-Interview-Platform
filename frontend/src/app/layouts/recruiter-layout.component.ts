import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-recruiter-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">
            <span class="material-icons-outlined logo-icon">psychology</span>
          </div>
          <div class="brand-info">
            <div class="brand-name">TalentMind <span class="badge-ai">AI</span></div>
            <div class="brand-sub">Enterprise Recruitment</div>
          </div>
        </div>

        <nav class="nav-menu">
          <div class="nav-section-title">MAIN</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/jobs" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">work_outline</span>
            <span>Jobs</span>
          </a>
          <a routerLink="/candidates" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">people_outline</span>
            <span>Candidates</span>
          </a>
          <a routerLink="/pipeline" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">view_kanban</span>
            <span>Pipeline</span>
          </a>
          <a routerLink="/interviews" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">video_camera_front</span>
            <span>Interview Plans</span>
          </a>

          <div class="nav-section-title">INTELLIGENCE</div>
          <a routerLink="/assistant" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">smart_toy</span>
            <span>AI Assistant</span>
          </a>
          <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
            <span class="material-icons-outlined">insights</span>
            <span>Analytics</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="demo-candidate-link">
            <a routerLink="/candidate/interview/priya-demo-active-invite-2026" target="_blank" class="candidate-test-btn">
              <span class="material-icons-outlined">open_in_new</span>
              <span>Test Candidate Portal</span>
            </a>
          </div>
          <div class="user-profile">
            <div class="user-avatar">
              {{ (auth.currentUser()?.firstName || 'U')[0] }}
            </div>
            <div class="user-meta">
              <div class="user-name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</div>
              <div class="user-role">{{ auth.currentUser()?.roleCode }}</div>
            </div>
            <button (click)="auth.logout()" class="logout-btn" title="Sign out">
              <span class="material-icons-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <header class="top-header">
          <div class="header-left">
            <span class="org-tag">
              <span class="material-icons-outlined">domain</span>
              Acme Technologies Inc.
            </span>
          </div>
          <div class="header-right">
            <span class="mode-badge">
              <span class="status-dot"></span>
              Human-in-the-Loop Active
            </span>
          </div>
        </header>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: var(--bg-main);
    }

    .sidebar {
      width: 260px;
      background: #0f172a;
      color: #cbd5e1;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #1e293b;
      flex-shrink: 0;
    }

    .brand {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #1e293b;

      .brand-logo {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #4f46e5, #8b5cf6);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      }

      .brand-name {
        font-weight: 700;
        font-size: 1.125rem;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .badge-ai {
        background: #4f46e5;
        font-size: 0.65rem;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 800;
      }

      .brand-sub {
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .nav-menu {
      flex: 1;
      padding: 20px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .nav-section-title {
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #475569;
        padding: 12px 12px 6px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 8px;
        color: #94a3b8;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.15s ease;

        &:hover {
          color: #ffffff;
          background: #1e293b;
        }

        &.active {
          color: #ffffff;
          background: #4f46e5;
        }
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .candidate-test-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        background: #1e293b;
        border: 1px dashed #475569;
        border-radius: 8px;
        color: #38bdf8;
        font-size: 0.8125rem;
        font-weight: 500;

        &:hover {
          background: #334155;
          color: #7dd3fc;
        }
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #334155;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-meta {
          flex: 1;
          overflow: hidden;

          .user-name {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-role {
            font-size: 0.6875rem;
            color: #64748b;
          }
        }

        .logout-btn {
          background: none;
          border: none;
          color: #64748b;
          padding: 6px;
          border-radius: 6px;

          &:hover {
            color: #ef4444;
            background: #1e293b;
          }
        }
      }
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-header {
      height: 60px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;

      .org-tag {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-secondary);
      }

      .mode-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }
      }
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
    }
  `]
})
export class RecruiterLayoutComponent {
  constructor(public auth: AuthService) {}
}
