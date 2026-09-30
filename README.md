# TalentMind AI — Enterprise AI Screening, Interview & Assessment Platform

[![CI/CD Pipeline](https://github.com/starlord-9/AI-Screening-Interview-Platform/actions/workflows/ci.yml/badge.svg)](https://github.com/starlord-9/AI-Screening-Interview-Platform/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%20%2F%206.0-blue.svg)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-22.x%20Standalone-dd0031.svg)](https://angular.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**TalentMind AI** is an enterprise-grade AI screening, interview, and assessment platform designed for modern recruiting organizations. Combining capabilities found across **HireVue**, **HackerRank**, **Spark Hire**, and modern ATS platforms, TalentMind AI streamlines the candidate evaluation lifecycle while strictly upholding **Human-in-the-Loop AI hiring governance**.

---

## 🌟 Key Platform Capabilities

### 1. 🛡️ Human-in-the-Loop Ethical AI Governance
* **AI as Evidence Assistant, Not Decision Maker:** The AI summarizes transcripts, extracts competencies, and cites verbatim quotes. **Final hiring, progression, and rejection decisions remain strictly with human recruiters.**
* **Protected Trait Safeguards:** Under no circumstances does the platform score attractiveness, accent, facial expressions, tone, gender, race, or infer protected characteristics.
* **Audit-Trailed Score Overrides:** Recruiters can freely adjust AI competency scores (1.0 to 5.0) with mandatory justification notes preserved in immutable audit logs.

### 2. ⚡ Zero-Registration Candidate Interview Portal
* **No Account Required:** Candidates access interview rooms using secure, high-entropy cryptographic invitation tokens (e.g. `priya-demo-active-invite-2026`).
* **Explicit Informed Consent:** Transparent consent gates for video recording, AI competency evidence extraction, and neutral browser integrity observation.
* **Pre-Interview Hardware & Audio Check:** Real-time camera feed verification, microphone volume level meter, and test audio tone.
* **Multi-Modal Response Runner:**
  * **Video Recording:** Browser-native WebRTC recording with instant playback.
  * **Interactive Coding Sandbox:** In-browser code editor with TypeScript test cases, execution console, and assertion scoring.
  * **Audio & Structured Text:** STAR method guidance for behavioral questions.

### 3. 🔍 Neutral Browser Integrity Monitoring Subsystem
* **Observable Signal Logging:** Records neutral facts (e.g. `TAB_VISIBILITY_HIDDEN`, `FOCUS_LOST`, `FULLSCREEN_EXITED`) with uncertainty levels and durations.
* **No False Accusations:** Neutral terminology is strictly enforced. Events are never labeled as *"cheating"*, *"fraud"*, or *"dishonest"*.
* **Recruiter Verification:** Recruiters review signals chronologically alongside the video timeline with one-click *Acknowledge* or *Dismiss* actions.

### 4. 🎯 Job Description Auto-Extractor & Competency Mapper
* **Unstructured JD Parsing:** Ingests raw job descriptions, automatically extracting required skills, responsibilities, and mapping weighted competency rubrics.
* **Resume Evidence Matrix:** Ingests candidate resumes and maps exact quote citations against specific job requirements with match confidence percentages.

### 5. 🤖 Grounded Recruiter AI Copilot (RAG)
* **Verifiable Question-Answering:** Recruiter chat assistant capable of answering questions about candidate answers, coding solutions, and experience gaps.
* **Strict Source Grounding:** Every insight is paired with explicit verbatim citations from candidate interview transcripts or uploaded resumes.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       TALENTMIND AI                         │
├──────────────────────────────┬──────────────────────────────┤
│       Angular Frontend       │       Node.js Backend        │
│   (Port 80 / 4200)           │   (Port 5000)                │
├──────────────────────────────┼──────────────────────────────┤
│ • Angular 22 Standalone      │ • Express 5 & TypeScript     │
│ • Signals State Management   │ • Prisma ORM 6.x             │
│ • Angular Material UI        │ • SQLite (Dev) / SQL Server  │
│ • WebRTC MediaRecorder       │ • HTTP 206 Partial Streaming │
│ • Reactive Pipeline Kanban   │ • JWT RBAC Auth & Bcrypt     │
│ • Grounded AI Copilot Chat   │ • Grounded RAG Assistant     │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** >= 20.x
* **npm** >= 10.x
* **Docker & Docker Compose** *(optional for containerized deployment)*

### 1. Local Development Setup

#### Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
# Server starts on http://localhost:5000
```

#### Frontend:
```bash
cd frontend
npm install
npm start
# Application serves on http://localhost:4200
```

### 2. Docker Compose Deployment (One-Command Boot)
```bash
docker-compose up --build -d
```
The application will be accessible at:
* **Frontend Application & Candidate Portal:** `http://localhost`
* **Backend API & Health Check:** `http://localhost:5000/health`

---

## 🔑 Pre-Seeded Demo Credentials & Links

### Recruiter Workspace:
* **URL:** `http://localhost:4200/login`
* **Admin Demo Login:**
  * **Email:** `admin@acme-tech.example.com`
  * **Password:** `Admin@123456`
* **Recruiter Demo Login:**
  * **Email:** `recruiter@acme-tech.example.com`
  * **Password:** `Admin@123456`

### Candidate Zero-Registration Interview Portal:
* **Direct Invitation Link (Priya Sharma Demo):**
  * `http://localhost:4200/candidate/interview/priya-demo-active-invite-2026`
* **Features:** Hardware readiness test, live camera recorder, coding test runner, and submission confirmation.

### Recruiter Evaluation Review Hub:
* **Completed Session Review (Alex Rivera):**
  * Direct Link: `http://localhost:4200/review/sess-demo-alex-001`
  * Features: Video recording player, synchronized transcript, AI rubric with verbatim quotes, recruiter score override modal, and neutral browser integrity timeline.

---

## 🧪 Automated Testing & Verification

The project includes exhaustive integration and unit test suites:

### Backend Integration Tests (100% Pass Rate):
```bash
cd backend
npm test
```
```
 PASS  tests/api.test.ts
  TalentMind AI API Test Suite
    ✓ 1. System Health & Diagnostics (17 ms)
    ✓ 2. Authentication & JWT RBAC (79 ms)
    ✓ 3. Organization & Job Creation with Competency Rubric (39 ms)
    ✓ 4. AI Job Description Analysis & Competency Extraction (18 ms)
    ✓ 5. Candidate Creation & Evidence Matching Matrix (45 ms)
    ✓ 6. AI Interview Plan Generation (31 ms)
    ✓ 7. High-Entropy Candidate Invitation Token Creation (28 ms)
    ✓ 8. Public Zero-Registration Invitation Token Validation (15 ms)
    ✓ 9. Candidate Session Runner Lifecycle (56 ms)
    ✓ 10. Recruiter Session Review Hub & Signed Streaming (27 ms)
    ✓ 11. Recruiter Score Override with Audit Justification (38 ms)
    ✓ 12. Grounded AI Recruiter Assistant with Citations (25 ms)
    ✓ 13. Recruitment Funnel Analytics (19 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

### Frontend Build & Unit Tests:
```bash
cd frontend
npm test -- --watch=false
npm run build
```
```
✓ App should create the app (60ms)
Application bundle generation complete.
0 errors, 0 warnings.
```

---

## 📂 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # SQLite development schema
│   │   ├── schema.sqlserver.prisma # Production Azure SQL schema
│   │   └── sqlserver-schema.sql # Raw T-SQL DDL schema
│   ├── src/
│   │   ├── config/              # Environment & constants
│   │   ├── controllers/         # REST API route handlers
│   │   ├── db/
│   │   │   └── seed.ts          # Comprehensive seeder script
│   │   ├── middleware/          # JWT auth, RBAC, audit, error handlers
│   │   ├── routes/              # Express API routers
│   │   ├── services/            # AI evaluation, RAG, sandboxes
│   │   ├── app.ts               # Express application configuration
│   │   └── server.ts            # Bootloader & health checks
│   ├── tests/
│   │   └── api.test.ts          # End-to-end integration tests
│   └── Dockerfile               # Backend container image
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/      # Angular route guards
│   │   │   │   └── services/    # Injectable REST services
│   │   │   ├── layouts/         # Recruiter shell layout
│   │   │   ├── pages/           # Standalone views
│   │   │   │   ├── analytics/   # Funnel & KPI dashboards
│   │   │   │   ├── assistant/   # Grounded RAG Copilot chat
│   │   │   │   ├── candidate-interview/ # Zero-registration candidate room
│   │   │   │   ├── candidates/  # Candidates & evidence matrix
│   │   │   │   ├── dashboard/   # Recruiter command center
│   │   │   │   ├── interviews/  # AI interview authoring
│   │   │   │   ├── jobs/        # Job descriptions & AI extractor
│   │   │   │   ├── login/       # Authentication & demo shortcuts
│   │   │   │   ├── pipeline/    # Kanban stage board
│   │   │   │   └── review/      # Video player, rubric & overrides
│   │   │   ├── app.config.ts    # Providers & router configuration
│   │   │   └── app.routes.ts    # Application route table
│   │   ├── index.html           # Fonts & material icons
│   │   └── styles.scss          # Design system & CSS tokens
│   ├── nginx.conf               # Production Nginx reverse proxy
│   └── Dockerfile               # Frontend container image
├── docs/                        # Architecture, API & Rubric specifications
├── docker-compose.yml           # Multi-container orchestration
└── README.md                    # Project documentation
```

---

## 📜 Compliance & AI Ethics

TalentMind AI has been engineered in alignment with emerging global AI hiring standards (including EU AI Act High-Risk AI System provisions and NYC Local Law 144 requirements):
1. **No Autonomous Adverse Actions:** AI never rejects or disqualifies candidates automatically.
2. **Transparent Explanations:** Every evaluation is explained with verbatim quotes from the candidate's answers.
3. **Audited Score Overrides:** Recruiters have total authority to override machine evaluations, maintaining an immutable audit log.
4. **Observable Browser Signals Only:** Integrity signals are logged as factual events without speculative accusations.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
