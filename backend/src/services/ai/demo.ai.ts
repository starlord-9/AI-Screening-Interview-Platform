import { AIProvider } from './ai.interface';
import { ExtractedRequirement, ParsedResumeData, EvidenceMatch, StructuredEvaluation } from '../../types';
import { logger } from '../../utils/logger';

export class DemoAIProvider implements AIProvider {
  async analyzeJobDescription(description: string): Promise<{
    responsibilities: string[];
    technicalSkills: string[];
    preferredSkills: string[];
    domainKnowledge: string[];
    educationRequirements?: string;
    certifications?: string;
    requirements: ExtractedRequirement[];
  }> {
    logger.info('DemoAIProvider: analyzing job description');
    const lower = description.toLowerCase();

    const techSkillsFound: string[] = [];
    const keywords = [
      'angular',
      'typescript',
      'node.js',
      'javascript',
      'python',
      'sql server',
      'azure',
      'docker',
      'graphql',
      'rest api',
      'rxjs',
      'webrtc',
      'microservices',
      'ci/cd'
    ];

    keywords.forEach((kw) => {
      if (lower.includes(kw.toLowerCase())) {
        techSkillsFound.push(kw.toUpperCase());
      }
    });

    if (techSkillsFound.length === 0) {
      techSkillsFound.push('ANGULAR', 'TYPESCRIPT', 'NODE.JS', 'REST APIS', 'SQL');
    }

    const requirements: ExtractedRequirement[] = [
      {
        category: 'TECHNICAL',
        text: `Demonstrated experience building scalable modern web applications using ${techSkillsFound.slice(0, 3).join(', ')}`,
        weight: 1.5,
        isMandatory: true,
        sourceParagraph: 'Extracted from Core Technical Stack and Requirements'
      },
      {
        category: 'EXPERIENCE',
        text: '3+ years architecting full-stack systems, designing RESTful APIs, and implementing secure database models',
        weight: 1.2,
        isMandatory: true,
        sourceParagraph: 'Extracted from Experience & Qualification criteria'
      },
      {
        category: 'TECHNICAL',
        text: 'Strong proficiency in state management (RxJS / Signals) and clean component architectures',
        weight: 1.0,
        isMandatory: true,
        sourceParagraph: 'Extracted from Frontend Architecture responsibilities'
      },
      {
        category: 'DOMAIN',
        text: 'Knowledge of cloud deployment patterns, containerization (Docker), and automated CI/CD pipelines',
        weight: 1.0,
        isMandatory: false,
        sourceParagraph: 'Extracted from DevOps & Cloud expectations'
      },
      {
        category: 'SOFT_SKILL',
        text: 'Effective cross-functional communication, clear technical documentation, and collaborative code reviews',
        weight: 0.8,
        isMandatory: true,
        sourceParagraph: 'Extracted from Team Collaboration & Engineering Leadership'
      }
    ];

    return {
      responsibilities: [
        'Design and implement high-performance frontend interfaces using Angular and Angular Material.',
        'Develop secure, resilient REST API microservices in Node.js and TypeScript.',
        'Model and optimize relational database schemas for high concurrency and auditability.',
        'Collaborate with product designers and engineering teams to define scalable architectures.'
      ],
      technicalSkills: techSkillsFound,
      preferredSkills: ['Azure Cloud Services', 'Docker & Kubernetes', 'WebRTC / Media Stream APIs', 'Unit & Integration Testing (Jest/Playwright)'],
      domainKnowledge: ['Enterprise SaaS Architecture', 'Secure Authentication & RBAC', 'Data Retention & Privacy Compliance'],
      educationRequirements: "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience",
      certifications: 'Relevant Microsoft Azure / Cloud Developer certifications a plus',
      requirements
    };
  }

  async parseResume(rawText: string): Promise<ParsedResumeData> {
    logger.info('DemoAIProvider: parsing candidate resume');

    // Extract basic information or supply robust structured data
    return {
      name: 'Alex Rivera',
      email: 'alex.rivera.dev@example.com',
      phone: '+1 (555) 382-9104',
      summary:
        'Senior Full-Stack Software Engineer with 5+ years of experience architecting enterprise SaaS platforms using Angular, TypeScript, Node.js, and SQL. Proven track record of improving application throughput and leading high-performing teams.',
      skills: [
        'Angular (v14-v20)',
        'TypeScript',
        'Node.js',
        'Express',
        'RxJS & Signals',
        'SQL Server / PostgreSQL',
        'Prisma ORM',
        'Docker',
        'Azure Cloud',
        'REST & GraphQL APIs',
        'Jest / Jasmine'
      ],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'CloudScale Solutions',
          duration: '2023 - Present',
          highlights: [
            'Architected distributed microservices in Node.js/TypeScript serving over 2M monthly API requests with 99.98% uptime.',
            'Redesigned core client application into Angular standalone components with modern Signal-based state management, reducing bundle load times by 40%.',
            'Implemented automated CI/CD pipelines in GitHub Actions and managed Docker container deployments on Azure Container Apps.'
          ]
        },
        {
          title: 'Full Stack Engineer',
          company: 'Nexus Infotech',
          duration: '2021 - 2023',
          highlights: [
            'Built responsive recruiting analytics dashboards with Angular Material and high-concurrency SQL Server data feeds.',
            'Designed secure role-based access control (RBAC) and JWT token rotation mechanisms adhering to enterprise compliance standards.',
            'Optimized SQL stored procedures and database indexes, reducing query latency across mission-critical endpoints by 65%.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'State University of Technology',
          year: '2021'
        }
      ],
      certifications: ['Azure Certified Developer Associate (AZ-204)', 'Docker Certified Associate']
    };
  }

  async matchEvidence(
    requirements: Array<{ id: string; text: string; category: string }>,
    resume: ParsedResumeData
  ): Promise<EvidenceMatch[]> {
    logger.info('DemoAIProvider: matching candidate evidence to job requirements');

    return requirements.map((req) => {
      if (req.category === 'TECHNICAL') {
        return {
          requirementId: req.id,
          requirementText: req.text,
          quote:
            'Architected distributed microservices in Node.js/TypeScript... and redesigned client application into Angular standalone components with modern Signal-based state management.',
          section: 'WORK_EXPERIENCE - CloudScale Solutions',
          confidenceScore: 0.94,
          matchLevel: 'STRONG',
          gapAnalysis: 'Demonstrates deep hands-on architectural experience with both Angular and Node.js.'
        };
      } else if (req.category === 'EXPERIENCE') {
        return {
          requirementId: req.id,
          requirementText: req.text,
          quote:
            '5+ years of experience across CloudScale Solutions (2023-Present) and Nexus Infotech (2021-2023) designing RESTful APIs and optimizing relational databases.',
          section: 'WORK_EXPERIENCE & SUMMARY',
          confidenceScore: 0.91,
          matchLevel: 'STRONG',
          gapAnalysis: 'Exceeds the 3-year requirement with documented full-stack delivery experience.'
        };
      } else if (req.category === 'DOMAIN') {
        return {
          requirementId: req.id,
          requirementText: req.text,
          quote:
            'Implemented automated CI/CD pipelines in GitHub Actions and managed Docker container deployments on Azure Container Apps.',
          section: 'WORK_EXPERIENCE & CERTIFICATIONS',
          confidenceScore: 0.88,
          matchLevel: 'STRONG',
          gapAnalysis: 'Holds Azure AZ-204 certification and has direct container production experience.'
        };
      } else {
        return {
          requirementId: req.id,
          requirementText: req.text,
          quote:
            'Collaborated closely across engineering and product teams to lead code reviews and establish architectural standards.',
          section: 'WORK_EXPERIENCE - Nexus Infotech',
          confidenceScore: 0.82,
          matchLevel: 'MODERATE',
          gapAnalysis: 'Solid collaborative background noted; can be further explored in behavioral interview questions.'
        };
      }
    });
  }

  async generateInterviewPlan(
    jobTitle: string,
    requirements: Array<{ text: string; category: string }>,
    durationMinutes: number
  ): Promise<
    Array<{
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
    }>
  > {
    logger.info('DemoAIProvider: generating structured interview plan');

    return [
      {
        orderIndex: 0,
        questionText:
          'Please introduce yourself and highlight a complex full-stack web project you delivered using Angular and Node.js.',
        category: 'INTRODUCTION',
        difficulty: 'EASY',
        expectedCompetency: 'Professional Background & Communication',
        timeLimitSeconds: 180,
        answerType: 'VIDEO',
        scoringCriteria: {
          keyCriteria: ['Clear technical articulation', 'Relevance to role stack', 'Scope and personal ownership'],
          benchmark: 'Candidate clearly describes architecture, personal contribution, and technologies utilized.'
        }
      },
      {
        orderIndex: 1,
        questionText:
          'In Angular, how do you approach state management between components? Compare RxJS Observables with modern Angular Signals.',
        category: 'TECHNICAL',
        difficulty: 'MEDIUM',
        expectedCompetency: 'Angular Architecture & State Management',
        timeLimitSeconds: 240,
        answerType: 'VIDEO',
        scoringCriteria: {
          keyCriteria: [
            'Understanding of reactivity and change detection',
            'Signal primitives (computed, effect) vs BehaviorSubject',
            'Memory leak avoidance and subscription lifecycle'
          ],
          benchmark:
            'Explains reactivity differences, synchronous pull vs asynchronous stream push, and practical migration scenarios.'
        }
      },
      {
        orderIndex: 2,
        questionText:
          'How do you design RESTful APIs in Node.js to ensure high resilience, rate limiting, and defensive validation against malformed inputs?',
        category: 'TECHNICAL',
        difficulty: 'MEDIUM',
        expectedCompetency: 'Node.js Backend & API Security',
        timeLimitSeconds: 240,
        answerType: 'VIDEO',
        scoringCriteria: {
          keyCriteria: ['Schema validation (e.g. Zod)', 'Rate limiting and security headers', 'Centralized error handling and idempotency'],
          benchmark: 'Mentions schema validation, avoiding unhandled promise rejections, and defensive middleware architecture.'
        }
      },
      {
        orderIndex: 3,
        questionText:
          'Walk through a scenario where a SQL query was causing latency spikes in production. What tools and indexing techniques did you use to diagnose and fix it?',
        category: 'PROBLEM_SOLVING',
        difficulty: 'HARD',
        expectedCompetency: 'Database Query Optimization',
        timeLimitSeconds: 240,
        answerType: 'AUDIO',
        scoringCriteria: {
          keyCriteria: ['Execution plan analysis', 'Index selection (clustered vs non-clustered)', 'Deadlock resolution and connection pooling'],
          benchmark:
            'Gives concrete diagnostic steps (EXPLAIN/Showplan, indexing, reducing N+1 queries) and explains measurable before/after metrics.'
        }
      },
      {
        orderIndex: 4,
        questionText:
          'Write a function in TypeScript/JavaScript that validates whether an incoming token or string satisfies security requirements and sanitizes untrusted input.',
        category: 'CODING',
        difficulty: 'MEDIUM',
        expectedCompetency: 'Algorithm & Secure Coding',
        timeLimitSeconds: 300,
        answerType: 'CODING',
        scoringCriteria: {
          keyCriteria: ['Correct handling of edge cases', 'Clean TypeScript types', 'Time and space complexity'],
          benchmark: 'Code compiles, runs cleanly, and passes all edge test cases.'
        },
        codeStarterSnippet: `/**
 * Validates and sanitizes an authentication token or candidate identifier.
 * Returns true if valid format, false otherwise.
 */
function validateTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  // Implement validation (must be alphanumeric, length between 16 and 64)
  const tokenRegex = /^[a-zA-Z0-9_-]{16,64}$/;
  return tokenRegex.test(token.trim());
}

// Example usage:
console.log(validateTokenFormat("sec_token_9823471928371982"));
`,
        codeTestCases: [
          { input: '"sec_token_9823471928371982"', expectedOutput: 'true', description: 'Valid alphanumeric token format' },
          { input: '"short"', expectedOutput: 'false', description: 'Reject tokens under 16 characters' },
          { input: '"invalid!token$chars#"', expectedOutput: 'false', description: 'Reject tokens with special illegal characters' }
        ]
      },
      {
        orderIndex: 5,
        questionText:
          'Do you have any questions for our engineering leadership regarding our architecture, release cycles, or team culture?',
        category: 'CANDIDATE_QUESTIONS',
        difficulty: 'EASY',
        expectedCompetency: 'Candidate Engagement & Culture Alignment',
        timeLimitSeconds: 180,
        answerType: 'TEXT',
        scoringCriteria: {
          keyCriteria: ['Thoughtful curiosity about technical stack', 'Engineering practices inquiry'],
          benchmark: 'Candidate asks substantive questions regarding tech stack or roadmap.'
        }
      }
    ];
  }

  async generateFollowUp(
    currentQuestion: string,
    candidateAnswer: string,
    competency: string
  ): Promise<{
    hasFollowUp: boolean;
    followUpQuestion?: string;
    rationale?: string;
  }> {
    if (candidateAnswer.length > 50 && candidateAnswer.toLowerCase().includes('angular')) {
      return {
        hasFollowUp: true,
        followUpQuestion:
          'You mentioned managing route security with Angular. Could you clarify how you differentiate route authorization from user authentication in that architecture?',
        rationale: 'Candidate touched on route guards; probing on defense-in-depth authorization separation.'
      };
    }
    return { hasFollowUp: false };
  }

  async evaluateResponse(
    questionText: string,
    expectedCompetency: string,
    candidateAnswer: string,
    scoringCriteriaJson?: string,
    codeSubmission?: { code: string; language: string; testCasesPassed: number; testCasesTotal: number }
  ): Promise<StructuredEvaluation> {
    logger.info('DemoAIProvider: evaluating response for competency', { expectedCompetency });

    if (!candidateAnswer || candidateAnswer.trim().length < 15) {
      return {
        competency: expectedCompetency,
        summary: 'Candidate response was brief or incomplete.',
        evidence: [],
        strengths: [],
        gaps: ['Insufficient evidence provided in candidate answer to evaluate this competency.'],
        score: 2.0,
        maxScore: 5.0,
        confidence: 'LOW'
      };
    }

    if (codeSubmission) {
      const passRate = codeSubmission.testCasesTotal > 0 ? codeSubmission.testCasesPassed / codeSubmission.testCasesTotal : 1.0;
      const score = Math.round((2.0 + passRate * 3.0) * 10) / 10;
      return {
        competency: expectedCompetency,
        summary: `Candidate submitted ${codeSubmission.language} solution passing ${codeSubmission.testCasesPassed}/${codeSubmission.testCasesTotal} test cases.`,
        evidence: [
          {
            quote: codeSubmission.code.substring(0, 120) + '...',
            timestampStart: 0,
            timestampEnd: 15
          }
        ],
        strengths: ['Correct algorithmic structure', 'Handled edge cases cleanly in automated tests'],
        gaps: passRate < 1.0 ? ['Failed some boundary condition test cases'] : [],
        score,
        maxScore: 5.0,
        confidence: 'HIGH'
      };
    }

    return {
      competency: expectedCompetency,
      summary:
        'Candidate articulated a structured, practical approach with concrete technical examples and industry-standard practices.',
      evidence: [
        {
          quote: candidateAnswer.length > 100 ? candidateAnswer.slice(0, 100) + '...' : candidateAnswer,
          timestampStart: 12,
          timestampEnd: 48
        }
      ],
      strengths: [
        'Demonstrated practical grasp of architectural principles',
        'Structured explanation with clear cause-and-effect reasoning',
        'Directly addressed the question prompt without unnecessary tangents'
      ],
      gaps: ['Could have elaborated further on quantitative production metrics or error edge conditions.'],
      score: 4.2,
      maxScore: 5.0,
      confidence: 'HIGH'
    };
  }

  async queryRecruiterAssistant(
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
  }> {
    logger.info('DemoAIProvider: answering recruiter assistant query', { query: userQuery });
    const qLower = userQuery.toLowerCase();

    if (qLower.includes('summar') || qLower.includes('overview')) {
      return {
        answer: `Summary for **${contextData.candidateName}** applying for **${contextData.jobTitle}**:\n\nThe candidate demonstrated strong competencies across Angular frontend architecture, Node.js API design, and SQL database tuning. Overall evidence indicates solid senior-level full-stack experience with high clarity of communication and clean coding practices.`,
        citations: [
          'Resume: 5+ years experience at CloudScale Solutions and Nexus Infotech',
          'Interview Question 1: Angular Signals and RxJS reactivity comparison',
          'Interview Question 4: Technical coding assessment (100% test pass rate)'
        ],
        suggestedFollowUps: [
          'What evidence supports their SQL optimization background?',
          'Were any interview integrity signals recorded during the session?',
          'Compare candidate performance against the senior benchmark.'
        ]
      };
    } else if (qLower.includes('integrity') || qLower.includes('signal') || qLower.includes('concern')) {
      return {
        answer: `**Integrity Signal Review for ${contextData.candidateName}**:\n\n${contextData.integritySummary || 'During the session, 2 standard browser events were noted: a brief window blur of 4 seconds and a normal fullscreen adjustment. Both events were categorized as low severity and consistent with standard browser interactions. No critical anomalies were recorded.'}`,
        citations: [
          'Integrity Log: Event #EV-01 (WINDOW_BLUR, duration 4s, severity: LOW)',
          'Candidate Consent: Explicit candidate recording and monitoring agreement on file'
        ],
        suggestedFollowUps: [
          'Jump to recording timestamp for Event #EV-01',
          'Inspect full integrity timeline'
        ]
      };
    } else {
      return {
        answer: `Based on the interview records for **${contextData.candidateName}**:\n\nThe candidate provided substantive evidence on ${contextData.jobTitle} requirements, specifically detailing modular component boundaries, reactive state management, and defensive REST API design. All claims matched the timeline and achievements detailed on their parsed resume.`,
        citations: [
          'Candidate Transcript: Question 2 (REST API architecture)',
          'Resume Evidence Mapping: Technical Skills Index'
        ],
        suggestedFollowUps: [
          'Summarize candidate technical interview',
          'Show competency scores breakdown'
        ]
      };
    }
  }
}
