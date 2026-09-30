-- ============================================================================
-- TalentMind AI - Production SQL Server / Azure SQL Database Schema Script
-- Target: Microsoft SQL Server 2019+ / Azure SQL Database
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Organizations')
BEGIN
    CREATE TABLE Organizations (
        id NVARCHAR(64) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        slug NVARCHAR(100) NOT NULL UNIQUE,
        logoUrl NVARCHAR(1000) NULL,
        website NVARCHAR(500) NULL,
        retentionDays INT NOT NULL DEFAULT 365,
        allowedDomains NVARCHAR(1000) NULL,
        settingsJson NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        email NVARCHAR(255) NOT NULL UNIQUE,
        passwordHash NVARCHAR(255) NOT NULL,
        firstName NVARCHAR(100) NOT NULL,
        lastName NVARCHAR(100) NOT NULL,
        roleCode NVARCHAR(50) NOT NULL DEFAULT 'RECRUITER',
        status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        lastLoginAt DATETIME2 NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Users_OrgId ON Users(organizationId);
    CREATE INDEX IX_Users_Email ON Users(email);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Jobs')
BEGIN
    CREATE TABLE Jobs (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        title NVARCHAR(255) NOT NULL,
        department NVARCHAR(100) NOT NULL,
        location NVARCHAR(100) NOT NULL,
        employmentType NVARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
        experienceLevel NVARCHAR(50) NOT NULL DEFAULT 'MID',
        salaryMin INT NULL,
        salaryMax INT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
        description NVARCHAR(MAX) NOT NULL,
        responsibilitiesJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        requiredSkillsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        preferredSkillsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        education NVARCHAR(255) NULL,
        certifications NVARCHAR(500) NULL,
        screeningCriteriaJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        status NVARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        interviewDurationMinutes INT NOT NULL DEFAULT 30,
        interviewMode NVARCHAR(50) NOT NULL DEFAULT 'MIXED',
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Jobs_OrgId ON Jobs(organizationId);
    CREATE INDEX IX_Jobs_Status ON Jobs(status);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'JobRequirements')
BEGIN
    CREATE TABLE JobRequirements (
        id NVARCHAR(64) PRIMARY KEY,
        jobId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Jobs(id) ON DELETE CASCADE,
        category NVARCHAR(50) NOT NULL,
        text NVARCHAR(1000) NOT NULL,
        weight FLOAT NOT NULL DEFAULT 1.0,
        isMandatory BIT NOT NULL DEFAULT 1,
        sourceParagraph NVARCHAR(500) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_JobRequirements_JobId ON JobRequirements(jobId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Candidates')
BEGIN
    CREATE TABLE Candidates (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        firstName NVARCHAR(100) NOT NULL,
        lastName NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        phone NVARCHAR(50) NULL,
        stage NVARCHAR(50) NOT NULL DEFAULT 'APPLIED',
        notes NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Candidates_OrgId ON Candidates(organizationId);
    CREATE INDEX IX_Candidates_Email ON Candidates(email);
    CREATE INDEX IX_Candidates_Stage ON Candidates(stage);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CandidateJobs')
BEGIN
    CREATE TABLE CandidateJobs (
        id NVARCHAR(64) PRIMARY KEY,
        candidateId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Candidates(id) ON DELETE CASCADE,
        jobId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Jobs(id) ON DELETE CASCADE,
        appliedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        currentStage NVARCHAR(50) NOT NULL DEFAULT 'APPLIED',
        matchScore FLOAT NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_CandidateJob UNIQUE(candidateId, jobId)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Resumes')
BEGIN
    CREATE TABLE Resumes (
        id NVARCHAR(64) PRIMARY KEY,
        candidateId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Candidates(id) ON DELETE CASCADE,
        fileName NVARCHAR(255) NOT NULL,
        fileUrl NVARCHAR(1000) NULL,
        fileSizeBytes INT NOT NULL DEFAULT 0,
        mimeType NVARCHAR(100) NOT NULL DEFAULT 'application/pdf',
        rawText NVARCHAR(MAX) NOT NULL,
        parsedDataJson NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        skillsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        experienceJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        educationJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        certificationsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Resumes_CandidateId ON Resumes(candidateId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ResumeEvidences')
BEGIN
    CREATE TABLE ResumeEvidences (
        id NVARCHAR(64) PRIMARY KEY,
        resumeId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Resumes(id) ON DELETE CASCADE,
        jobRequirementId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES JobRequirements(id) ON DELETE CASCADE,
        quote NVARCHAR(MAX) NOT NULL,
        section NVARCHAR(100) NOT NULL,
        confidenceScore FLOAT NOT NULL DEFAULT 0.85,
        matchLevel NVARCHAR(50) NOT NULL DEFAULT 'STRONG',
        gapAnalysis NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_ResumeEvidences_ResumeId ON ResumeEvidences(resumeId);
    CREATE INDEX IX_ResumeEvidences_RequirementId ON ResumeEvidences(jobRequirementId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Interviews')
BEGIN
    CREATE TABLE Interviews (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        jobId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Jobs(id) ON DELETE CASCADE,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        isPublished BIT NOT NULL DEFAULT 0,
        timeLimitMinutes INT NOT NULL DEFAULT 30,
        totalQuestions INT NOT NULL DEFAULT 0,
        scoringRubricJson NVARCHAR(MAX) NOT NULL DEFAULT '{"technicalWeight":40,"problemSolvingWeight":25,"communicationWeight":20,"behavioralWeight":15}',
        createdBy NVARCHAR(255) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Interviews_OrgId ON Interviews(organizationId);
    CREATE INDEX IX_Interviews_JobId ON Interviews(jobId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewQuestions')
BEGIN
    CREATE TABLE InterviewQuestions (
        id NVARCHAR(64) PRIMARY KEY,
        interviewId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Interviews(id) ON DELETE CASCADE,
        orderIndex INT NOT NULL,
        questionText NVARCHAR(MAX) NOT NULL,
        category NVARCHAR(50) NOT NULL,
        difficulty NVARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
        expectedCompetency NVARCHAR(100) NOT NULL,
        timeLimitSeconds INT NOT NULL DEFAULT 180,
        answerType NVARCHAR(50) NOT NULL DEFAULT 'VIDEO',
        isRequired BIT NOT NULL DEFAULT 1,
        scoringCriteriaJson NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        followUpRulesJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        codeStarterSnippet NVARCHAR(MAX) NULL,
        codeTestCasesJson NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_InterviewQuestions_InterviewId ON InterviewQuestions(interviewId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Invitations')
BEGIN
    CREATE TABLE Invitations (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        candidateId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Candidates(id) ON DELETE CASCADE,
        interviewId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Interviews(id) ON DELETE CASCADE,
        tokenHash NVARCHAR(128) NOT NULL UNIQUE,
        rawTokenHint NVARCHAR(10) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        expiresAt DATETIME2 NOT NULL,
        consentedAt DATETIME2 NULL,
        singleUseStart BIT NOT NULL DEFAULT 0,
        startedAt DATETIME2 NULL,
        completedAt DATETIME2 NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Invitations_TokenHash ON Invitations(tokenHash);
    CREATE INDEX IX_Invitations_CandidateId ON Invitations(candidateId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewSessions')
BEGIN
    CREATE TABLE InterviewSessions (
        id NVARCHAR(64) PRIMARY KEY,
        invitationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Invitations(id) ON DELETE CASCADE,
        candidateId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Candidates(id) ON DELETE NO ACTION,
        interviewId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Interviews(id) ON DELETE NO ACTION,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE NO ACTION,
        status NVARCHAR(50) NOT NULL DEFAULT 'CREATED',
        currentQuestionIndex INT NOT NULL DEFAULT 0,
        startedAt DATETIME2 NULL,
        lastActivityAt DATETIME2 NULL,
        completedAt DATETIME2 NULL,
        browserInfoJson NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        deviceMetadataJson NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        ipAddress NVARCHAR(50) NULL,
        attemptNumber INT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_InterviewSessions_InvitationId ON InterviewSessions(invitationId);
    CREATE INDEX IX_InterviewSessions_Status ON InterviewSessions(status);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewResponses')
BEGIN
    CREATE TABLE InterviewResponses (
        id NVARCHAR(64) PRIMARY KEY,
        sessionId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES InterviewSessions(id) ON DELETE CASCADE,
        questionId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES InterviewQuestions(id) ON DELETE NO ACTION,
        responseMode NVARCHAR(50) NOT NULL DEFAULT 'VIDEO',
        textContent NVARCHAR(MAX) NULL,
        codeLanguage NVARCHAR(50) NULL,
        codeSubmitted NVARCHAR(MAX) NULL,
        testCasesPassed INT NULL,
        testCasesTotal INT NULL,
        durationSeconds INT NOT NULL DEFAULT 0,
        submittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        status NVARCHAR(50) NOT NULL DEFAULT 'SUBMITTED'
    );
    CREATE INDEX IX_InterviewResponses_SessionId ON InterviewResponses(sessionId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recordings')
BEGIN
    CREATE TABLE Recordings (
        id NVARCHAR(64) PRIMARY KEY,
        responseId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES InterviewResponses(id) ON DELETE CASCADE,
        sessionId NVARCHAR(64) NOT NULL,
        candidateId NVARCHAR(64) NOT NULL,
        durationSeconds INT NOT NULL DEFAULT 0,
        mimeType NVARCHAR(100) NOT NULL DEFAULT 'video/webm',
        blobKey NVARCHAR(500) NOT NULL,
        blobUrl NVARCHAR(1000) NULL,
        fileSizeBytes INT NOT NULL DEFAULT 0,
        status NVARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Recordings_ResponseId ON Recordings(responseId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transcripts')
BEGIN
    CREATE TABLE Transcripts (
        id NVARCHAR(64) PRIMARY KEY,
        responseId NVARCHAR(64) NOT NULL UNIQUE FOREIGN KEY REFERENCES InterviewResponses(id) ON DELETE CASCADE,
        sessionId NVARCHAR(64) NOT NULL,
        fullText NVARCHAR(MAX) NOT NULL,
        segmentsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        confidence FLOAT NOT NULL DEFAULT 0.92,
        language NVARCHAR(20) NOT NULL DEFAULT 'en-US',
        status NVARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Transcripts_SessionId ON Transcripts(sessionId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluations')
BEGIN
    CREATE TABLE Evaluations (
        id NVARCHAR(64) PRIMARY KEY,
        responseId NVARCHAR(64) NOT NULL UNIQUE FOREIGN KEY REFERENCES InterviewResponses(id) ON DELETE CASCADE,
        sessionId NVARCHAR(64) NOT NULL,
        competency NVARCHAR(100) NOT NULL,
        summary NVARCHAR(MAX) NOT NULL,
        quoteEvidenceJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        strengthsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        gapsJson NVARCHAR(MAX) NOT NULL DEFAULT '[]',
        score FLOAT NOT NULL,
        maxScore FLOAT NOT NULL DEFAULT 5.0,
        confidence NVARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
        isOverridden BIT NOT NULL DEFAULT 0,
        humanScore FLOAT NULL,
        overrideReason NVARCHAR(MAX) NULL,
        overriddenBy NVARCHAR(100) NULL,
        overriddenAt DATETIME2 NULL,
        modelIdentifier NVARCHAR(100) NOT NULL DEFAULT 'gpt-4o-recruitment-eval',
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Evaluations_SessionId ON Evaluations(sessionId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IntegrityEvents')
BEGIN
    CREATE TABLE IntegrityEvents (
        id NVARCHAR(64) PRIMARY KEY,
        sessionId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES InterviewSessions(id) ON DELETE CASCADE,
        candidateId NVARCHAR(64) NOT NULL,
        eventType NVARCHAR(100) NOT NULL,
        timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        durationSeconds INT NOT NULL DEFAULT 0,
        source NVARCHAR(50) NOT NULL DEFAULT 'BROWSER',
        facts NVARCHAR(MAX) NOT NULL,
        evidence NVARCHAR(MAX) NULL,
        uncertainty NVARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
        browser NVARCHAR(100) NULL,
        device NVARCHAR(100) NULL,
        severity NVARCHAR(20) NOT NULL DEFAULT 'INFO',
        reviewStatus NVARCHAR(50) NOT NULL DEFAULT 'UNREVIEWED',
        reviewerId NVARCHAR(100) NULL,
        reviewComment NVARCHAR(MAX) NULL,
        resolution NVARCHAR(100) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_IntegrityEvents_SessionId ON IntegrityEvents(sessionId);
    CREATE INDEX IX_IntegrityEvents_Severity ON IntegrityEvents(severity);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        actorId NVARCHAR(100) NULL,
        actorEmail NVARCHAR(255) NULL,
        action NVARCHAR(100) NOT NULL,
        entity NVARCHAR(100) NOT NULL,
        entityId NVARCHAR(100) NOT NULL,
        metadataJson NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        ipAddress NVARCHAR(50) NULL,
        userAgent NVARCHAR(500) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_AuditLogs_OrgId ON AuditLogs(organizationId);
    CREATE INDEX IX_AuditLogs_Action ON AuditLogs(action);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConsentRecords')
BEGIN
    CREATE TABLE ConsentRecords (
        id NVARCHAR(64) PRIMARY KEY,
        candidateId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Candidates(id) ON DELETE CASCADE,
        invitationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Invitations(id) ON DELETE NO ACTION,
        policyVersion NVARCHAR(50) NOT NULL DEFAULT '2026.1',
        consentedToRecording BIT NOT NULL DEFAULT 1,
        consentedToAIAnalysis BIT NOT NULL DEFAULT 1,
        consentedToIntegritySignals BIT NOT NULL DEFAULT 1,
        ipAddress NVARCHAR(50) NULL,
        userAgent NVARCHAR(500) NULL,
        consentedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_ConsentRecords_CandidateId ON ConsentRecords(candidateId);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DataRetentionPolicies')
BEGIN
    CREATE TABLE DataRetentionPolicies (
        id NVARCHAR(64) PRIMARY KEY,
        organizationId NVARCHAR(64) NOT NULL FOREIGN KEY REFERENCES Organizations(id) ON DELETE CASCADE,
        resumeRetentionDays INT NOT NULL DEFAULT 180,
        recordingRetentionDays INT NOT NULL DEFAULT 90,
        transcriptRetentionDays INT NOT NULL DEFAULT 365,
        auditRetentionDays INT NOT NULL DEFAULT 730,
        autoDeleteEnabled BIT NOT NULL DEFAULT 1,
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
