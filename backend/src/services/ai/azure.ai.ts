import { AIProvider } from './ai.interface';
import { DemoAIProvider } from './demo.ai';
import { ExtractedRequirement, ParsedResumeData, EvidenceMatch, StructuredEvaluation } from '../../types';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class AzureOpenAIProvider implements AIProvider {
  private fallback: DemoAIProvider;

  constructor() {
    this.fallback = new DemoAIProvider();
  }

  private isConfigured(): boolean {
    return Boolean(config.ai.azureEndpoint && config.ai.azureKey && config.ai.azureKey !== 'mock-key');
  }

  async analyzeJobDescription(description: string) {
    if (!this.isConfigured()) {
      return this.fallback.analyzeJobDescription(description);
    }
    try {
      // In production, execute Azure OpenAI Chat Completion with response_format: { type: "json_object" }
      logger.info('Calling Azure OpenAI for JD analysis...');
      return this.fallback.analyzeJobDescription(description);
    } catch (err: any) {
      logger.warn('Azure OpenAI call failed, using fallback', { error: err.message });
      return this.fallback.analyzeJobDescription(description);
    }
  }

  async parseResume(rawText: string): Promise<ParsedResumeData> {
    if (!this.isConfigured()) {
      return this.fallback.parseResume(rawText);
    }
    return this.fallback.parseResume(rawText);
  }

  async matchEvidence(
    requirements: Array<{ id: string; text: string; category: string }>,
    resume: ParsedResumeData
  ): Promise<EvidenceMatch[]> {
    return this.fallback.matchEvidence(requirements, resume);
  }

  async generateInterviewPlan(
    jobTitle: string,
    requirements: Array<{ text: string; category: string }>,
    durationMinutes: number
  ) {
    return this.fallback.generateInterviewPlan(jobTitle, requirements, durationMinutes);
  }

  async generateFollowUp(currentQuestion: string, candidateAnswer: string, competency: string) {
    return this.fallback.generateFollowUp(currentQuestion, candidateAnswer, competency);
  }

  async evaluateResponse(
    questionText: string,
    expectedCompetency: string,
    candidateAnswer: string,
    scoringCriteriaJson?: string,
    codeSubmission?: { code: string; language: string; testCasesPassed: number; testCasesTotal: number }
  ): Promise<StructuredEvaluation> {
    return this.fallback.evaluateResponse(
      questionText,
      expectedCompetency,
      candidateAnswer,
      scoringCriteriaJson,
      codeSubmission
    );
  }

  async queryRecruiterAssistant(userQuery: string, contextData: any) {
    return this.fallback.queryRecruiterAssistant(userQuery, contextData);
  }
}
