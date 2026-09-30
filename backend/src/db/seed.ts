import { prisma } from './prisma';
import { cryptoUtil } from '../utils/crypto';
import { logger } from '../utils/logger';

export async function seedDatabase() {
  logger.info('Starting TalentMind AI database seeding...');

  // 1. Create Organization
  let org = await prisma.organization.findUnique({
    where: { slug: 'acme-technologies' }
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Acme Technologies',
        slug: 'acme-technologies',
        website: 'https://acme-tech.example.com',
        retentionDays: 365,
        allowedDomains: 'acme-tech.example.com',
        settingsJson: JSON.stringify({
          requireIntegrityCheck: true,
          defaultTimeLimitMinutes: 30,
          allowRetakes: false,
          theme: 'light'
        })
      }
    });
  }

  // 2. Data Retention Policy
  const existingPolicy = await prisma.dataRetentionPolicy.findFirst({
    where: { organizationId: org.id }
  });
  if (!existingPolicy) {
    await prisma.dataRetentionPolicy.create({
      data: {
        organizationId: org.id,
        resumeRetentionDays: 180,
        recordingRetentionDays: 90,
        transcriptRetentionDays: 365,
        auditRetentionDays: 730,
        autoDeleteEnabled: true
      }
    });
  }

  // 3. Create Users
  const defaultPasswordHash = await cryptoUtil.hashPassword('Admin@123456');

  const adminEmail = 'admin@acme-tech.example.com';
  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: adminEmail,
        passwordHash: defaultPasswordHash,
        firstName: 'Sarah',
        lastName: 'Connor',
        roleCode: 'ADMIN',
        status: 'ACTIVE'
      }
    });
  }

  const recruiterEmail = 'recruiter@acme-tech.example.com';
  let recruiterUser = await prisma.user.findUnique({ where: { email: recruiterEmail } });
  if (!recruiterUser) {
    recruiterUser = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: recruiterEmail,
        passwordHash: defaultPasswordHash,
        firstName: 'Marcus',
        lastName: 'Brody',
        roleCode: 'RECRUITER',
        status: 'ACTIVE'
      }
    });
  }

  // 4. Create Jobs
  let job1 = await prisma.job.findFirst({
    where: { organizationId: org.id, title: 'Senior Full-Stack Engineer (Angular & Node.js)' }
  });

  if (!job1) {
    job1 = await prisma.job.create({
      data: {
        organizationId: org.id,
        title: 'Senior Full-Stack Engineer (Angular & Node.js)',
        department: 'Core Platform Engineering',
        location: 'Remote (US/EU)',
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        salaryMin: 140000,
        salaryMax: 185000,
        currency: 'USD',
        description: `We are looking for a Senior Full-Stack Software Engineer to build resilient distributed microservices in Node.js and modern reactive interfaces in Angular 20+. You will design APIs, optimize SQL database transactions, and lead key architecture decisions for our mission-critical SaaS infrastructure.`,
        responsibilitiesJson: JSON.stringify([
          'Architect and build high-performance Angular web apps utilizing Angular Signals and RxJS.',
          'Develop resilient Node.js / Express microservices with TypeScript and relational databases.',
          'Lead automated CI/CD and containerization deployment pipelines with Docker and Azure.',
          'Mentor junior developers and participate actively in architecture reviews.'
        ]),
        requiredSkillsJson: JSON.stringify(['Angular', 'TypeScript', 'Node.js', 'Express', 'SQL', 'REST APIs', 'RxJS']),
        preferredSkillsJson: JSON.stringify(['Azure Cloud', 'Docker', 'Prisma ORM', 'WebRTC / Media APIs', 'Jest']),
        education: "Bachelor's degree in Computer Science or equivalent practical experience",
        certifications: 'Cloud / Architecture certifications a plus',
        screeningCriteriaJson: JSON.stringify([
          '5+ years full-stack development experience',
          'Demonstrated deep knowledge of Angular component lifecycle and reactive state',
          'Solid database indexing and schema design background'
        ]),
        status: 'ACTIVE',
        interviewDurationMinutes: 30,
        interviewMode: 'MIXED',
        requirements: {
          create: [
            {
              category: 'TECHNICAL',
              text: 'Demonstrated experience building scalable modern web applications using Angular and Node.js',
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
          ]
        }
      }
    });
  }

  let job2 = await prisma.job.findFirst({
    where: { organizationId: org.id, title: 'Lead Backend & Data Engineer' }
  });

  if (!job2) {
    job2 = await prisma.job.create({
      data: {
        organizationId: org.id,
        title: 'Lead Backend & Data Engineer',
        department: 'Data Platform',
        location: 'New York, NY (Hybrid)',
        employmentType: 'FULL_TIME',
        experienceLevel: 'LEAD',
        salaryMin: 165000,
        salaryMax: 210000,
        currency: 'USD',
        description: `Join our Data Platform team to build ultra-low-latency ingestion pipelines, SQL Server architectures, and streaming analytical systems.`,
        responsibilitiesJson: JSON.stringify([
          'Design and maintain high-throughput ingestion pipelines.',
          'Optimize SQL Server stored procedures and database partition strategies.',
          'Ensure SOC2 data governance and automated retention policies.'
        ]),
        requiredSkillsJson: JSON.stringify(['Node.js', 'Python', 'SQL Server', 'Kafka / EventHub', 'Data Modeling']),
        preferredSkillsJson: JSON.stringify(['Azure Synapse', 'Docker', 'Redis', 'Kubernetes']),
        status: 'ACTIVE',
        interviewDurationMinutes: 35,
        interviewMode: 'TECHNICAL',
        requirements: {
          create: [
            {
              category: 'TECHNICAL',
              text: 'Expertise in high-concurrency SQL optimization, partitioning, and indexing strategies',
              weight: 1.5,
              isMandatory: true
            },
            {
              category: 'EXPERIENCE',
              text: '6+ years in backend distributed systems and data engineering',
              weight: 1.3,
              isMandatory: true
            }
          ]
        }
      }
    });
  }

  // 5. Create Published Interview for Job 1
  let interview1 = await prisma.interview.findFirst({
    where: { organizationId: org.id, jobId: job1.id }
  });

  if (!interview1) {
    interview1 = await prisma.interview.create({
      data: {
        organizationId: org.id,
        jobId: job1.id,
        title: 'Senior Full-Stack Engineer Technical & Behavioral Interview',
        description: 'Comprehensive evidence-based assessment evaluating Angular reactivity, Node.js API resilience, SQL optimization, and coding proficiency.',
        version: 1,
        isPublished: true,
        timeLimitMinutes: 30,
        totalQuestions: 5,
        scoringRubricJson: JSON.stringify({
          technicalWeight: 40,
          problemSolvingWeight: 25,
          communicationWeight: 20,
          behavioralWeight: 15
        }),
        createdBy: `${recruiterUser.firstName} ${recruiterUser.lastName}`,
        questions: {
          create: [
            {
              orderIndex: 0,
              questionText: 'Please introduce yourself and highlight a complex full-stack web project you delivered using Angular and Node.js.',
              category: 'INTRODUCTION',
              difficulty: 'EASY',
              expectedCompetency: 'Professional Background & Communication',
              timeLimitSeconds: 180,
              answerType: 'VIDEO',
              scoringCriteriaJson: JSON.stringify({
                keyCriteria: ['Clear technical articulation', 'Relevance to role stack', 'Scope and personal ownership'],
                benchmark: 'Candidate clearly describes architecture, personal contribution, and technologies utilized.'
              })
            },
            {
              orderIndex: 1,
              questionText: 'In Angular, how do you approach state management between components? Compare RxJS Observables with modern Angular Signals.',
              category: 'TECHNICAL',
              difficulty: 'MEDIUM',
              expectedCompetency: 'Angular Architecture & State Management',
              timeLimitSeconds: 240,
              answerType: 'VIDEO',
              scoringCriteriaJson: JSON.stringify({
                keyCriteria: ['Understanding of reactivity and change detection', 'Signal primitives (computed, effect) vs BehaviorSubject', 'Memory leak avoidance'],
                benchmark: 'Explains reactivity differences, synchronous pull vs asynchronous stream push, and practical migration scenarios.'
              })
            },
            {
              orderIndex: 2,
              questionText: 'How do you design RESTful APIs in Node.js to ensure high resilience, rate limiting, and defensive validation against malformed inputs?',
              category: 'TECHNICAL',
              difficulty: 'MEDIUM',
              expectedCompetency: 'Node.js Backend & API Security',
              timeLimitSeconds: 240,
              answerType: 'VIDEO',
              scoringCriteriaJson: JSON.stringify({
                keyCriteria: ['Schema validation (e.g. Zod)', 'Rate limiting and security headers', 'Centralized error handling and idempotency'],
                benchmark: 'Mentions schema validation, avoiding unhandled promise rejections, and defensive middleware architecture.'
              })
            },
            {
              orderIndex: 3,
              questionText: 'Walk through a scenario where a SQL query was causing latency spikes in production. What tools and indexing techniques did you use to diagnose and fix it?',
              category: 'PROBLEM_SOLVING',
              difficulty: 'HARD',
              expectedCompetency: 'Database Query Optimization',
              timeLimitSeconds: 240,
              answerType: 'AUDIO',
              scoringCriteriaJson: JSON.stringify({
                keyCriteria: ['Execution plan analysis', 'Index selection (clustered vs non-clustered)', 'Deadlock resolution and connection pooling'],
                benchmark: 'Gives concrete diagnostic steps and explains measurable before/after metrics.'
              })
            },
            {
              orderIndex: 4,
              questionText: 'Write a TypeScript function that validates whether an incoming token format satisfies security requirements and sanitizes untrusted input.',
              category: 'CODING',
              difficulty: 'MEDIUM',
              expectedCompetency: 'Algorithm & Secure Coding',
              timeLimitSeconds: 300,
              answerType: 'CODING',
              scoringCriteriaJson: JSON.stringify({
                keyCriteria: ['Correct handling of edge cases', 'Clean TypeScript types', 'Time and space complexity'],
                benchmark: 'Code compiles, runs cleanly, and passes all edge test cases.'
              }),
              codeStarterSnippet: `function validateTokenFormat(token: string): boolean {\n  if (!token || typeof token !== 'string') return false;\n  const tokenRegex = /^[a-zA-Z0-9_-]{16,64}$/;\n  return tokenRegex.test(token.trim());\n}\n\nconsole.log(validateTokenFormat("sec_token_9823471928371982"));`,
              codeTestCasesJson: JSON.stringify([
                { input: '"sec_token_9823471928371982"', expectedOutput: 'true', description: 'Valid alphanumeric token format' },
                { input: '"short"', expectedOutput: 'false', description: 'Reject tokens under 16 characters' },
                { input: '"invalid!token$chars#"', expectedOutput: 'false', description: 'Reject tokens with special illegal characters' }
              ])
            }
          ]
        }
      },
      include: { questions: { orderBy: { orderIndex: 'asc' } } }
    });
  }

  // 6. Create Candidates
  // Candidate 1: Alex Rivera (Completed interview with full review data, recording, evaluation, and integrity events)
  let candidate1 = await prisma.candidate.findFirst({
    where: { organizationId: org.id, email: 'alex.rivera.dev@example.com' }
  });

  if (!candidate1) {
    candidate1 = await prisma.candidate.create({
      data: {
        organizationId: org.id,
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.rivera.dev@example.com',
        phone: '+1 (555) 382-9104',
        stage: 'FINAL_REVIEW',
        notes: 'Top candidate. Performed strongly in Angular Signals architecture and SQL index optimization.',
        candidateJobs: {
          create: {
            jobId: job1.id,
            currentStage: 'FINAL_REVIEW',
            matchScore: 94
          }
        },
        stageHistory: {
          create: [
            { previousStage: 'NONE', newStage: 'APPLIED', changedBy: 'System', note: 'Direct applicant' },
            { previousStage: 'APPLIED', newStage: 'SCREENING', changedBy: recruiterUser.firstName, note: 'Resume parsed and invitation dispatched' },
            { previousStage: 'SCREENING', newStage: 'INTERVIEW', changedBy: 'System', note: 'Digital interview completed' },
            { previousStage: 'INTERVIEW', newStage: 'FINAL_REVIEW', changedBy: recruiterUser.firstName, note: 'Scored 4.4/5.0 across competencies' }
          ]
        },
        recruiterNotes: {
          create: {
            organizationId: org.id,
            userId: recruiterUser.id,
            noteText: 'Strong technical communicator. Recommending for immediate offer review.',
            isPrivate: false
          }
        }
      }
    });

    // Create Resume for Alex Rivera
    const resume1 = await prisma.resume.create({
      data: {
        candidateId: candidate1.id,
        fileName: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
        fileSizeBytes: 245000,
        mimeType: 'application/pdf',
        rawText: 'Alex Rivera - Senior Software Engineer with 5+ years experience building scalable enterprise SaaS in Angular, TypeScript, Node.js, and SQL.',
        parsedDataJson: JSON.stringify({
          name: 'Alex Rivera',
          email: 'alex.rivera.dev@example.com',
          summary: 'Senior Full-Stack Software Engineer with 5+ years building scalable SaaS in Angular, TypeScript, and Node.js.',
          skills: ['Angular', 'TypeScript', 'Node.js', 'Express', 'RxJS & Signals', 'SQL Server', 'Docker', 'Azure', 'Prisma ORM'],
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'CloudScale Solutions',
              duration: '2023 - Present',
              highlights: ['Architected distributed microservices in Node.js/TypeScript', 'Migrated Angular components to Signals']
            }
          ]
        }),
        skillsJson: JSON.stringify(['Angular', 'TypeScript', 'Node.js', 'Express', 'RxJS', 'Signals', 'SQL Server', 'Docker', 'Azure']),
        experienceJson: JSON.stringify([
          { title: 'Senior Software Engineer', company: 'CloudScale Solutions', duration: '2023 - Present' }
        ]),
        educationJson: JSON.stringify([
          { degree: 'B.S. in Computer Science', institution: 'State University of Technology', year: '2021' }
        ]),
        certificationsJson: JSON.stringify(['Azure Developer Associate (AZ-204)', 'Docker Certified Associate'])
      }
    });

    // Map Evidence for Alex Rivera
    const reqs = await prisma.jobRequirement.findMany({ where: { jobId: job1.id } });
    for (const r of reqs) {
      await prisma.resumeEvidence.create({
        data: {
          resumeId: resume1.id,
          jobRequirementId: r.id,
          quote: 'Architected distributed microservices in Node.js/TypeScript and redesigned client application into Angular standalone components with modern Signal-based state management.',
          section: 'WORK_EXPERIENCE - CloudScale Solutions',
          confidenceScore: 0.94,
          matchLevel: 'STRONG',
          gapAnalysis: 'Demonstrates direct hands-on architectural experience matching requirement.'
        }
      });
    }

    // Create Invitation for Alex Rivera
    const rawToken1 = 'alex_rivera_demo_invitation_token_2026';
    const tokenHash1 = cryptoUtil.hashToken(rawToken1);
    const invitation1 = await prisma.invitation.create({
      data: {
        organizationId: org.id,
        candidateId: candidate1.id,
        interviewId: interview1.id,
        tokenHash: tokenHash1,
        rawTokenHint: cryptoUtil.getHint(rawToken1),
        status: 'COMPLETED',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 3600 * 1000),
        completedAt: new Date(Date.now() - 1800 * 1000),
        consentRecords: {
          create: {
            candidateId: candidate1.id,
            policyVersion: '2026.1',
            consentedToRecording: true,
            consentedToAIAnalysis: true,
            consentedToIntegritySignals: true,
            ipAddress: '192.168.1.105',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0'
          }
        }
      }
    });

    // Create Completed Session for Alex Rivera
    const session1 = await prisma.interviewSession.create({
      data: {
        invitationId: invitation1.id,
        candidateId: candidate1.id,
        interviewId: interview1.id,
        organizationId: org.id,
        status: 'COMPLETED',
        currentQuestionIndex: 4,
        startedAt: new Date(Date.now() - 3600 * 1000),
        lastActivityAt: new Date(Date.now() - 1800 * 1000),
        completedAt: new Date(Date.now() - 1800 * 1000),
        browserInfoJson: JSON.stringify({ browser: 'Chrome', version: '130.0', os: 'Windows 11', screen: '1920x1080' }),
        deviceMetadataJson: JSON.stringify({ camera: 'HD Pro Webcam C920', microphone: 'Default Mic', audioOutput: 'Headphones' }),
        ipAddress: '192.168.1.105'
      }
    });

    // Create Responses, Recordings, Transcripts, Evaluations for session1
    const interviewQuestions = await prisma.interviewQuestion.findMany({
      where: { interviewId: interview1.id },
      orderBy: { orderIndex: 'asc' }
    });

    if (interviewQuestions.length >= 5) {
      // Q0: Introduction
      const r0 = await prisma.interviewResponse.create({
        data: {
          sessionId: session1.id,
          questionId: interviewQuestions[0].id,
          responseMode: 'VIDEO',
          durationSeconds: 110,
          submittedAt: new Date(Date.now() - 3400 * 1000),
          status: 'COMPLETED',
          recordings: {
            create: {
              sessionId: session1.id,
              candidateId: candidate1.id,
              durationSeconds: 110,
              mimeType: 'video/webm',
              blobKey: 'recordings/demo/alex_intro.webm',
              blobUrl: 'http://localhost:5000/api/recordings/stream/demo-alex-intro',
              fileSizeBytes: 8400000,
              status: 'COMPLETED'
            }
          },
          transcript: {
            create: {
              sessionId: session1.id,
              fullText: 'Hello! I am Alex Rivera. For the past five years, I have architected full-stack enterprise web platforms. Most recently at CloudScale Solutions, I led the core engineering squad that built our customer analytics dashboard with Angular and Node.js microservices.',
              segmentsJson: JSON.stringify([
                { text: 'Hello! I am Alex Rivera. For the past five years, I have architected full-stack enterprise web platforms.', startMs: 0, endMs: 8000, confidence: 0.96 },
                { text: 'Most recently at CloudScale Solutions, I led the core engineering squad that built our customer analytics dashboard with Angular and Node.js microservices.', startMs: 8200, endMs: 18000, confidence: 0.94 }
              ]),
              confidence: 0.95,
              language: 'en-US'
            }
          },
          evaluation: {
            create: {
              sessionId: session1.id,
              competency: 'Professional Background & Communication',
              summary: 'Candidate delivered a well-structured introduction highlighting concrete full-stack architectural ownership matching the job stack.',
              quoteEvidenceJson: JSON.stringify([
                { quote: 'I led the core engineering squad that built our customer analytics dashboard with Angular and Node.js microservices.', timestampStart: 8, timestampEnd: 18 }
              ]),
              strengthsJson: JSON.stringify(['Clear articulation of engineering leadership', 'Direct alignment with Angular & Node.js tech stack']),
              gapsJson: JSON.stringify([]),
              score: 4.5,
              maxScore: 5.0,
              confidence: 'HIGH'
            }
          }
        }
      });

      // Q1: Angular Signals
      const r1 = await prisma.interviewResponse.create({
        data: {
          sessionId: session1.id,
          questionId: interviewQuestions[1].id,
          responseMode: 'VIDEO',
          durationSeconds: 145,
          submittedAt: new Date(Date.now() - 3100 * 1000),
          status: 'COMPLETED',
          recordings: {
            create: {
              sessionId: session1.id,
              candidateId: candidate1.id,
              durationSeconds: 145,
              mimeType: 'video/webm',
              blobKey: 'recordings/demo/alex_signals.webm',
              blobUrl: 'http://localhost:5000/api/recordings/stream/demo-alex-signals',
              fileSizeBytes: 11200000,
              status: 'COMPLETED'
            }
          },
          transcript: {
            create: {
              sessionId: session1.id,
              fullText: 'In Angular, traditional state management with RxJS BehaviorSubjects requires manual unsubscribing or using the async pipe to avoid memory leaks. Modern Angular Signals introduce synchronous reactive primitives—signals, computed values, and effects. Signals notify only the specific template nodes that depend on them, dramatically reducing zone.js change detection overhead.',
              segmentsJson: JSON.stringify([
                { text: 'In Angular, traditional state management with RxJS BehaviorSubjects requires manual unsubscribing or using the async pipe to avoid memory leaks.', startMs: 0, endMs: 12000, confidence: 0.96 },
                { text: 'Modern Angular Signals introduce synchronous reactive primitives—signals, computed values, and effects.', startMs: 12400, endMs: 22000, confidence: 0.95 },
                { text: 'Signals notify only the specific template nodes that depend on them, dramatically reducing zone.js change detection overhead.', startMs: 22500, endMs: 34000, confidence: 0.94 }
              ]),
              confidence: 0.95,
              language: 'en-US'
            }
          },
          evaluation: {
            create: {
              sessionId: session1.id,
              competency: 'Angular Architecture & State Management',
              summary: 'Candidate demonstrated deep, up-to-date mastery of Angular reactivity, accurately differentiating push-based async streams from synchronous Signal graphs.',
              quoteEvidenceJson: JSON.stringify([
                { quote: 'Signals notify only the specific template nodes that depend on them, dramatically reducing zone.js change detection overhead.', timestampStart: 22, timestampEnd: 34 }
              ]),
              strengthsJson: JSON.stringify(['In-depth knowledge of Angular Signals vs RxJS', 'Memory leak prevention understanding', 'Zone.js change detection optimization awareness']),
              gapsJson: JSON.stringify(['Could touch on interop functions like toSignal and toObservable']),
              score: 4.6,
              maxScore: 5.0,
              confidence: 'HIGH'
            }
          }
        }
      });

      // Q4: Coding Question
      const r4 = await prisma.interviewResponse.create({
        data: {
          sessionId: session1.id,
          questionId: interviewQuestions[4].id,
          responseMode: 'CODING',
          codeLanguage: 'typescript',
          codeSubmitted: `function validateTokenFormat(token: string): boolean {\n  if (!token || typeof token !== 'string') return false;\n  const clean = token.trim();\n  if (clean.length < 16 || clean.length > 64) return false;\n  const tokenRegex = /^[a-zA-Z0-9_-]+$/;\n  return tokenRegex.test(clean);\n}`,
          testCasesPassed: 3,
          testCasesTotal: 3,
          durationSeconds: 190,
          submittedAt: new Date(Date.now() - 1900 * 1000),
          status: 'COMPLETED',
          evaluation: {
            create: {
              sessionId: session1.id,
              competency: 'Algorithm & Secure Coding',
              summary: 'Candidate submitted high-quality TypeScript code passing 3/3 automated test cases with appropriate input sanitization and regex bounds.',
              quoteEvidenceJson: JSON.stringify([
                { quote: 'if (clean.length < 16 || clean.length > 64) return false; const tokenRegex = /^[a-zA-Z0-9_-]+$/;', timestampStart: 0, timestampEnd: 10 }
              ]),
              strengthsJson: JSON.stringify(['100% test case pass rate', 'Defensive validation against null/empty types', 'Clean regex boundary enforcement']),
              gapsJson: JSON.stringify([]),
              score: 5.0,
              maxScore: 5.0,
              confidence: 'HIGH'
            }
          }
        }
      });
    }

    // Create Neutral Integrity Events for session1
    await prisma.integrityEvent.create({
      data: {
        sessionId: session1.id,
        candidateId: candidate1.id,
        eventType: 'FULLSCREEN_EXIT',
        facts: 'Browser exited fullscreen mode for 3 seconds before restoring fullscreen',
        durationSeconds: 3,
        source: 'BROWSER_EVENT_LISTENER',
        uncertainty: 'LOW',
        severity: 'INFO',
        reviewStatus: 'REVIEWED',
        reviewerId: recruiterUser.id,
        reviewComment: 'Verified: Candidate adjusted screen layout; no anomalies.',
        resolution: 'Dismissed after human review'
      }
    });

    await prisma.integrityEvent.create({
      data: {
        sessionId: session1.id,
        candidateId: candidate1.id,
        eventType: 'WINDOW_BLUR',
        facts: 'Window focus lost for 4 seconds during question 2 transition',
        durationSeconds: 4,
        source: 'WINDOW_BLUR_EVENT',
        uncertainty: 'LOW',
        severity: 'LOW',
        reviewStatus: 'UNREVIEWED'
      }
    });
  }

  // Candidate 2: Priya Sharma (Screening Stage with Active Invitation ready to test!)
  let candidate2 = await prisma.candidate.findFirst({
    where: { organizationId: org.id, email: 'priya.sharma@example.com' }
  });

  if (!candidate2) {
    candidate2 = await prisma.candidate.create({
      data: {
        organizationId: org.id,
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@example.com',
        phone: '+1 (555) 749-2041',
        stage: 'SCREENING',
        notes: 'Promising candidate with 4 years Angular experience. Dispatched interview invitation.',
        candidateJobs: {
          create: {
            jobId: job1.id,
            currentStage: 'SCREENING',
            matchScore: 88
          }
        },
        stageHistory: {
          create: [
            { previousStage: 'NONE', newStage: 'APPLIED', changedBy: 'System', note: 'LinkedIn Easy Apply' },
            { previousStage: 'APPLIED', newStage: 'SCREENING', changedBy: recruiterUser.firstName, note: 'Invitation link issued' }
          ]
        }
      }
    });

    // Active invitation link ready for testing
    const rawToken2 = 'priya-demo-active-invite-2026';
    const tokenHash2 = cryptoUtil.hashToken(rawToken2);
    await prisma.invitation.create({
      data: {
        organizationId: org.id,
        candidateId: candidate2.id,
        interviewId: interview1.id,
        tokenHash: tokenHash2,
        rawTokenHint: cryptoUtil.getHint(rawToken2),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Candidate 3: Marcus Vance (Lead Backend applicant for Job 2)
  let candidate3 = await prisma.candidate.findFirst({
    where: { organizationId: org.id, email: 'marcus.vance@example.com' }
  });

  if (!candidate3) {
    candidate3 = await prisma.candidate.create({
      data: {
        organizationId: org.id,
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@example.com',
        phone: '+1 (555) 892-4412',
        stage: 'APPLIED',
        notes: 'Applied for Lead Backend Engineer. Resume shows 7+ years SQL Server and event streaming experience.',
        candidateJobs: {
          create: {
            jobId: job2.id,
            currentStage: 'APPLIED',
            matchScore: 91
          }
        },
        stageHistory: {
          create: [
            { previousStage: 'NONE', newStage: 'APPLIED', changedBy: 'System', note: 'Direct submission' }
          ]
        }
      }
    });
  }

  logger.info('Database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed process finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed process failed:', { error: err.message, stack: err.stack });
      process.exit(1);
    });
}

