export type UserRole = 'ADMIN' | 'ORG_OWNER' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER';

export type CandidateStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'TECHNICAL'
  | 'HIRING_MANAGER'
  | 'FINAL_REVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type InterviewStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export type AnswerType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'CODING' | 'MULTIPLE_CHOICE';

export type SessionStatus =
  | 'CREATED'
  | 'READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'INTERRUPTED'
  | 'COMPLETED'
  | 'LOCKED'
  | 'EXPIRED';

export type IntegrityEventType =
  | 'TAB_HIDDEN'
  | 'WINDOW_BLUR'
  | 'FULLSCREEN_EXIT'
  | 'SCREEN_SHARE_STARTED'
  | 'SCREEN_SHARE_STOPPED'
  | 'CAMERA_CHANGED'
  | 'MICROPHONE_CHANGED'
  | 'CLIPBOARD_COPY'
  | 'CLIPBOARD_PASTE'
  | 'NETWORK_INTERRUPTION'
  | 'MULTIPLE_SESSION_ATTEMPT'
  | 'DUPLICATE_SUBMISSION'
  | 'UNEXPECTED_AUDIO_ACTIVITY';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleCode: UserRole;
  organizationId: string;
}

export interface ExtractedRequirement {
  category: 'TECHNICAL' | 'SOFT_SKILL' | 'DOMAIN' | 'EDUCATION' | 'EXPERIENCE';
  text: string;
  weight: number;
  isMandatory: boolean;
  sourceParagraph?: string;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration?: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year?: string;
  }[];
  certifications: string[];
}

export interface EvidenceMatch {
  requirementId: string;
  requirementText: string;
  quote: string;
  section: string;
  confidenceScore: number;
  matchLevel: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  gapAnalysis?: string;
}

export interface StructuredEvaluation {
  competency: string;
  summary: string;
  evidence: {
    quote: string;
    timestampStart?: number;
    timestampEnd?: number;
  }[];
  strengths: string[];
  gaps: string[];
  score: number;
  maxScore: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}
