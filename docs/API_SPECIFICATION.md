# TalentMind AI REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Tenant (`/auth`)

### `POST /auth/login`
Authenticates a recruiter or admin user.
* **Request Body:**
  ```json
  {
    "email": "recruiter@acme-tech.example.com",
    "password": "Admin@123456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "id": "usr-recruiter-001",
        "email": "recruiter@acme-tech.example.com",
        "firstName": "Sarah",
        "lastName": "Jenkins",
        "roleCode": "RECRUITER"
      }
    }
  }
  ```

---

## 2. Jobs Management (`/jobs`)

### `GET /jobs`
Returns all job postings with requirement weights.
* **Headers:** `Authorization: Bearer <token>`

### `POST /jobs`
Creates a new job with structured competency requirements.

### `POST /jobs/analyze-raw-jd`
Ingests unformatted job description text and extracts structured competencies.
* **Request Body:**
  ```json
  {
    "description": "We are seeking a Staff Engineer with 5+ years of TypeScript and cloud architecture..."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "roleTitle": "Staff Software Engineer",
      "department": "Engineering",
      "requiredSkills": ["TypeScript", "Distributed Systems", "Cloud Architecture"],
      "extractedCompetencies": [...]
    }
  }
  ```

---

## 3. Candidate Zero-Registration Flow (`/invitations`, `/candidate-sessions`)

### `GET /invitations/public/:token`
Validates an invitation link for a candidate without requiring authentication.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "invitationId": "inv-priya-001",
      "candidateName": "Priya Sharma",
      "jobTitle": "Senior Full Stack Engineer",
      "timeLimitMinutes": 30,
      "totalQuestions": 5,
      "isCompleted": false
    }
  }
  ```

### `POST /candidate-sessions/start`
Begins an interview session with explicit candidate consents.
* **Request Body:**
  ```json
  {
    "token": "priya-demo-active-invite-2026",
    "consentedToRecording": true,
    "consentedToAIAnalysis": true,
    "consentedToIntegritySignals": true
  }
  ```

### `POST /candidate-sessions/:sessionId/responses`
Submits a response for a specific question.
* **Request Body:**
  ```json
  {
    "questionId": "q-1",
    "responseMode": "VIDEO",
    "durationSeconds": 120,
    "textContent": "..."
  }
  ```

### `POST /candidate-sessions/:sessionId/code-run`
Executes candidate code against test cases in a safe runner sandbox.
* **Request Body:**
  ```json
  {
    "code": "function maxSubArray(nums: number[]): number { ... }",
    "language": "typescript",
    "testCases": [
      { "description": "Standard array", "input": "[-2,1,-3,4,-1,2,1,-5,4]", "expectedOutput": "6" }
    ]
  }
  ```

### `POST /candidate-sessions/:sessionId/integrity-events`
Logs neutral observable browser signal.
* **Request Body:**
  ```json
  {
    "eventType": "TAB_VISIBILITY_HIDDEN",
    "facts": "Browser document visibility hidden signal observed.",
    "severity": "INFO",
    "uncertainty": "LOW"
  }
  ```

### `POST /candidate-sessions/:sessionId/complete`
Finalizes session, locks candidate input, and queues AI rubric evaluation.

---

## 4. Recruiter Review & Score Overrides (`/review`)

### `GET /review/sessions/:sessionId`
Returns the complete review package:
* Video & Audio recording links with signed streaming tokens
* Synchronized Speech-to-Text transcripts
* Question-by-question AI evaluation rubrics (scores, summary, quote evidence, strengths, gaps)
* Recruiter human overrides
* Browser integrity timeline

### `POST /review/evaluations/:evaluationId/override`
Allows authorized recruiter to override machine evaluation score with mandatory justification.
* **Request Body:**
  ```json
  {
    "humanScore": 4.8,
    "overrideReason": "Candidate demonstrated deep knowledge during follow-up discussion."
  }
  ```

### `POST /review/integrity-events/:eventId`
Sets status to `REVIEWED` or `DISMISSED` with reviewer comment.

---

## 5. Recruiter Grounded AI Copilot (`/assistant`)

### `POST /assistant/chat`
Answers recruiter questions with citations from transcripts and resumes.
* **Request Body:**
  ```json
  {
    "query": "Did Alex Rivera explain Angular Signals properly?",
    "candidateId": "cand-alex-001"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "answer": "Yes, Alex Rivera articulated Angular Signals clearly...",
      "citations": [
        {
          "source": "Question 2 Transcript (Timestamp 01:14)",
          "quote": "Signals provide fine-grained reactivity...",
          "confidence": 0.96
        }
      ]
    }
  }
  ```
