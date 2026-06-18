CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "AssessmentAnswers" (
        "Id" uuid NOT NULL,
        "AssessmentId" uuid NOT NULL,
        "AssessmentQuestionId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Skill" integer NOT NULL,
        "AnswerText" text,
        "TranscriptText" text,
        "AudioUrl" text,
        "Score" double precision,
        "Feedback" text,
        "AiFeedbackJson" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AssessmentAnswers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "AssessmentQuestions" (
        "Id" uuid NOT NULL,
        "Skill" integer NOT NULL,
        "Level" integer NOT NULL,
        "QuestionText" text NOT NULL,
        "Instruction" text,
        "PassageText" text,
        "AudioUrl" text,
        "AudioTranscript" text,
        "SpeakingPrompt" text,
        "WritingPrompt" text,
        "OptionsJson" text,
        "CorrectAnswerJson" text,
        "Explanation" text,
        "SourceLanguageCode" text,
        "IsAiGenerated" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AssessmentQuestions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Assessments" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "SourceLanguageCode" text NOT NULL,
        "TargetLanguageCode" text NOT NULL,
        "Status" integer NOT NULL,
        "OverallScore" double precision,
        "ListeningScore" double precision,
        "SpeakingScore" double precision,
        "ReadingScore" double precision,
        "WritingScore" double precision,
        "ResultLevel" integer,
        "SkillBreakdownJson" text,
        "WeakSkillsJson" text,
        "StartedAt" timestamp with time zone NOT NULL,
        "CompletedAt" timestamp with time zone,
        CONSTRAINT "PK_Assessments" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "AssessmentSections" (
        "Id" uuid NOT NULL,
        "AssessmentId" uuid NOT NULL,
        "Skill" integer NOT NULL,
        "Score" double precision,
        "MaxScore" double precision NOT NULL,
        "Feedback" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AssessmentSections" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Badges" (
        "Id" uuid NOT NULL,
        "Code" character varying(100) NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" character varying(1000) NOT NULL,
        "IconUrl" character varying(500),
        "ConditionType" character varying(100) NOT NULL,
        "ConditionValue" integer NOT NULL,
        CONSTRAINT "PK_Badges" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "ExerciseAttempts" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "ExerciseId" uuid NOT NULL,
        "AnswerJson" text,
        "IsCorrect" boolean NOT NULL,
        "Score" double precision NOT NULL,
        "Feedback" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_ExerciseAttempts" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Exercises" (
        "Id" uuid NOT NULL,
        "LessonId" uuid NOT NULL,
        "Type" integer NOT NULL,
        "Prompt" text NOT NULL,
        "Instruction" text,
        "SourceLanguageCode" text,
        "TargetText" text,
        "OptionsJson" text,
        "CorrectAnswerJson" text,
        "Explanation" text,
        "Difficulty" integer NOT NULL,
        "XpReward" integer NOT NULL,
        "OrderIndex" integer NOT NULL,
        "IsAiGenerated" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Exercises" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "FlashcardReviews" (
        "Id" uuid NOT NULL,
        "FlashcardId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Quality" integer NOT NULL,
        "OldInterval" integer NOT NULL,
        "NewInterval" integer NOT NULL,
        "OldEaseFactor" double precision NOT NULL,
        "NewEaseFactor" double precision NOT NULL,
        "ReviewedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_FlashcardReviews" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Flashcards" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "VocabularyId" uuid NOT NULL,
        "SourceLanguageCode" text NOT NULL,
        "EaseFactor" double precision NOT NULL,
        "Interval" integer NOT NULL,
        "Repetition" integer NOT NULL,
        "DueDate" timestamp with time zone NOT NULL,
        "LastReviewedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Flashcards" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Languages" (
        "Id" uuid NOT NULL,
        "Code" character varying(10) NOT NULL,
        "Name" character varying(100) NOT NULL,
        "NativeName" character varying(100) NOT NULL,
        "IsSourceSupported" boolean NOT NULL,
        "IsTargetSupported" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Languages" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "LearningPaths" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "TargetLanguageCode" text NOT NULL,
        "SourceLanguageCode" text NOT NULL,
        "CefrLevel" integer NOT NULL,
        "Title" text NOT NULL,
        "Description" text NOT NULL,
        "RecommendedLessonsJson" text,
        "WeakSkillsJson" text,
        "GeneratedFrom" integer NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_LearningPaths" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "LessonProgress" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "LessonId" uuid NOT NULL,
        "Status" integer NOT NULL,
        "Score" double precision NOT NULL,
        "CompletedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_LessonProgress" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Lessons" (
        "Id" uuid NOT NULL,
        "CefrLevel" integer NOT NULL,
        "TargetLanguageCode" text NOT NULL,
        "SourceLanguageCode" text,
        "Title" text NOT NULL,
        "Description" text NOT NULL,
        "Skill" integer NOT NULL,
        "Topic" text,
        "ContentSource" integer NOT NULL,
        "OrderIndex" integer NOT NULL,
        "EstimatedMinutes" integer NOT NULL,
        "XpReward" integer NOT NULL,
        "IsPublished" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Lessons" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "PronunciationAttempts" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "ExerciseId" uuid,
        "TargetText" text NOT NULL,
        "TranscriptText" text NOT NULL,
        "AudioUrl" text,
        "Score" double precision NOT NULL,
        "Accuracy" double precision NOT NULL,
        "Fluency" double precision,
        "Completeness" double precision,
        "Feedback" text,
        "WordLevelFeedbackJson" text,
        "Provider" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_PronunciationAttempts" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "StudySessions" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "StartedAt" timestamp with time zone NOT NULL,
        "EndedAt" timestamp with time zone,
        "DurationSeconds" integer NOT NULL,
        "XpEarned" integer NOT NULL,
        "LessonsCompleted" integer NOT NULL,
        CONSTRAINT "PK_StudySessions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "UserBadges" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "BadgeId" uuid NOT NULL,
        "EarnedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_UserBadges" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Users" (
        "Id" uuid NOT NULL,
        "Email" character varying(255) NOT NULL,
        "PasswordHash" character varying(500) NOT NULL,
        "FullName" character varying(200) NOT NULL,
        "AvatarUrl" character varying(500),
        "Role" character varying(50) NOT NULL,
        "Status" character varying(50) NOT NULL,
        "SourceLanguageCode" character varying(10) NOT NULL,
        "TargetLanguageCode" character varying(10) NOT NULL,
        "CurrentCefrLevel" character varying(10),
        "LevelSource" character varying(50),
        "Xp" integer NOT NULL,
        "StreakCount" integer NOT NULL,
        "LastStudyDate" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "UserSkillProfiles" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "OverallLevel" integer NOT NULL,
        "ListeningLevel" integer,
        "SpeakingLevel" integer,
        "ReadingLevel" integer,
        "WritingLevel" integer,
        "ListeningScore" double precision,
        "SpeakingScore" double precision,
        "ReadingScore" double precision,
        "WritingScore" double precision,
        "Source" integer NOT NULL,
        "LearningGoal" text,
        "PreferredTopicsJson" text,
        "Notes" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_UserSkillProfiles" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "Vocabularies" (
        "Id" uuid NOT NULL,
        "Word" text NOT NULL,
        "Ipa" text,
        "AudioUrl" text,
        "CefrLevel" integer NOT NULL,
        "PartOfSpeech" text,
        "ExampleSentence" text,
        "ContentSource" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Vocabularies" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "VocabularyTranslations" (
        "Id" uuid NOT NULL,
        "VocabularyId" uuid NOT NULL,
        "LanguageCode" text NOT NULL,
        "Meaning" text NOT NULL,
        "Explanation" text,
        "ExampleTranslation" text,
        CONSTRAINT "PK_VocabularyTranslations" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "XpTransactions" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Amount" integer NOT NULL,
        "Reason" text NOT NULL,
        "MetadataJson" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_XpTransactions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE TABLE "RefreshTokens" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "TokenHash" character varying(500) NOT NULL,
        "ExpiresAt" timestamp with time zone NOT NULL,
        "RevokedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Badges_Code" ON "Badges" ("Code");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Languages_Code" ON "Languages" ("Code");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE INDEX "IX_RefreshTokens_ExpiresAt" ON "RefreshTokens" ("ExpiresAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_RefreshTokens_TokenHash" ON "RefreshTokens" ("TokenHash");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE INDEX "IX_Users_Role" ON "Users" ("Role");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    CREATE INDEX "IX_Users_Status" ON "Users" ("Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260602012503_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260602012503_InitialCreate', '8.0.0');
    END IF;
END $EF$;
COMMIT;

