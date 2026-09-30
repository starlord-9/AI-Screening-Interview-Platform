import { ExtractedRequirement, ParsedResumeData, EvidenceMatch, StructuredEvaluation } from '../../types';

export interface AIProvider {
  analyzeJobDescription(description: string): Promise<{
    responsibilities: string[];
    technicalSkills: string[];
    preferredSkills: string[];
    domainKnowledge: string[];
    educationRequirements?: string;
    certifications?: string;
    requirements: ExtractedRequirement[];
  }>;

  parseResume(rawText: string): Promise<ParsedResumeData>;

  matchEvidence(requirements: Array<{ id: string; text: string; category: string }>, resume: ParsedResumeData): Promise<EvidenceMatch[]>;

  generateInterviewPlan(jobTitle: string, requirements: Array<{ text: string; category: string }>, durationMinutes: number): Promise<Array<{
    orderIndex: number;
    questionText: string;
    category: string;
    difficulty: string;
    expectedCompetency: string;
    timeLimitSeconds: number;
    answerType: 'TEXT' | 'AUDIO' | 'VIDEO' | 'CODING' | 'MULTIPLE_CHOICE';
    scoringCriteria: {
      keyCriteria: string[];
      benchmark: string;
    };
    codeStarterSnippet?: string;
    codeTestCases?: Array<{ input: string; expectedOutput: string; description: string }>;
  }>>;

  generateFollowUp(
    currentQuestion: string,
    candidateAnswer: string,
    competency: string
  ): Promise<{
    hasFollowUp: boolean;
    followUpQuestion?: string;
    rationale?: string;
  }>;

  evaluateResponse(
    questionText: string,
    expectedCompetency: string,
    candidateAnswer: string,
    scoringCriteriaJson?: string,
    codeSubmission?: { code: string; language: string; testCasesPassed: number; testCasesTotal: number }
  ): Promise<StructuredEvaluation>;

  queryRecruiterAssistant(
    userQuery: string,
    contextData: {
      candidateName: string;
      jobTitle: string;
      resumeSummary?: string;
      transcripts?: Array<{ questionText: string; answerText: string }>;
      evaluations?: Array<{ competency: string; score: number; summary: string }>;
      integritySummary?: string;
    }
  ): Promise<{
    answer: string;
    citations: string[];
    suggestedFollowUps: string[];
  }>;
}
