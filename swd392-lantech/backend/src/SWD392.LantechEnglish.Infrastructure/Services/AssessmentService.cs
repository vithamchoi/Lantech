using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Assessments;
using SWD392.LantechEnglish.Application.DTOs.LearningPaths;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class AssessmentService : IAssessmentService
{
    private readonly AppDbContext _context;
    private readonly IAIProvider _aiProvider;

    public AssessmentService(AppDbContext context, IAIProvider aiProvider)
    {
        _context = context;
        _aiProvider = aiProvider;
    }

    public Task<AssessmentAvailableDto> GetAvailableAssessmentAsync(CancellationToken cancellationToken = default)
    {
        var dto = new AssessmentAvailableDto
        {
            SupportedSkills = new List<string> { "Listening", "Speaking", "Reading", "Writing" },
            EstimatedTimeMinutes = 40,
            QuestionsPerSkill = 6,
            ScoringMethod = "Continuous scale mapped to CEFR standard A1-C1 levels.",
            CanUseAiGeneratedQuestions = true,
            CanUseSeededQuestionBank = true
        };
        return Task.FromResult(dto);
    }

    public async Task<AssessmentDetailDto> StartAssessmentAsync(Guid userId, StartAssessmentRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        // Check if there is an active assessment
        var activeAssessment = await _context.Assessments
            .Where(a => a.UserId == userId && a.Status == AssessmentStatus.InProgress)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeAssessment != null)
        {
            return await GetAssessmentDetailAsync(activeAssessment.Id, cancellationToken);
        }

        // Create new assessment
        var assessment = new Assessment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SourceLanguageCode = request.SourceLanguageCode,
            TargetLanguageCode = "en",
            Status = AssessmentStatus.InProgress,
            StartedAt = DateTime.UtcNow
        };

        _context.Assessments.Add(assessment);

        var selectedQuestions = new List<AssessmentQuestion>();
        var skills = new[] { SkillType.Listening, SkillType.Reading, SkillType.Writing, SkillType.Speaking };
        
        // Generate questions in parallel via AI
        var tasks = skills.Select(async skill =>
        {
            var skillQuestions = new List<AssessmentQuestion>();
            try
            {
                var json = await _aiProvider.GenerateAssessmentQuestionsAsync(skill, CefrLevel.B1, request.SourceLanguageCode, 2, cancellationToken);
                var aiQuestions = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(json);
                if (aiQuestions != null)
                {
                    foreach (var aiQ in aiQuestions)
                    {
                        var q = new AssessmentQuestion
                        {
                            Id = Guid.NewGuid(),
                            Skill = skill,
                            Level = CefrLevel.B1,
                            IsAiGenerated = true,
                            QuestionText = aiQ.TryGetValue("questionText", out var qt) && qt.ValueKind == JsonValueKind.String ? qt.GetString() : "",
                            Instruction = aiQ.TryGetValue("instruction", out var inst) && inst.ValueKind == JsonValueKind.String ? inst.GetString() : "",
                            Explanation = aiQ.TryGetValue("explanation", out var exp) && exp.ValueKind == JsonValueKind.String ? exp.GetString() : ""
                        };
                        
                        if (aiQ.TryGetValue("options", out var opt) && opt.ValueKind == JsonValueKind.Array)
                            q.OptionsJson = JsonSerializer.Serialize(opt);
                        
                        if (aiQ.TryGetValue("correctAnswer", out var ca))
                            q.CorrectAnswerJson = JsonSerializer.Serialize(ca.ValueKind == JsonValueKind.String ? ca.GetString() : ca.GetRawText());

                        if (skill == SkillType.Reading && aiQ.TryGetValue("passageText", out var pt) && pt.ValueKind == JsonValueKind.String)
                            q.PassageText = pt.GetString();
                            
                        if (skill == SkillType.Listening && aiQ.TryGetValue("audioTranscript", out var at) && at.ValueKind == JsonValueKind.String)
                        {
                            q.AudioTranscript = at.GetString();
                            try 
                            {
                                var audioBytes = await _aiProvider.GenerateAudioAsync(q.AudioTranscript ?? "", "alloy", cancellationToken);
                                q.AudioUrl = $"data:audio/mp3;base64,{Convert.ToBase64String(audioBytes)}";
                            }
                            catch
                            {
                                // fallback if audio fails
                            }
                        }
                            
                        if (skill == SkillType.Writing && aiQ.TryGetValue("writingPrompt", out var wp) && wp.ValueKind == JsonValueKind.String)
                            q.WritingPrompt = wp.GetString();
                            
                        if (skill == SkillType.Speaking && aiQ.TryGetValue("speakingPrompt", out var sp) && sp.ValueKind == JsonValueKind.String)
                            q.SpeakingPrompt = sp.GetString();

                        skillQuestions.Add(q);
                        _context.AssessmentQuestions.Add(q); // Save AI generated question to DB
                    }
                }
            }
            catch
            {
                // Fallback to mock on fail
                for (int i = 0; i < 2; i++)
                {
                    var mockQ = new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = skill,
                        Level = CefrLevel.B1,
                        IsAiGenerated = true,
                        QuestionText = $"Diagnostic {skill} prompt {i + 1} (Fallback)",
                        Instruction = "Read and follow the instruction.",
                    };
                    if (skill == SkillType.Reading || skill == SkillType.Listening)
                    {
                        mockQ.OptionsJson = JsonSerializer.Serialize(new[] { "Option A", "Option B", "Option C", "Option D" });
                        mockQ.CorrectAnswerJson = JsonSerializer.Serialize("Option A");
                    }
                    skillQuestions.Add(mockQ);
                    _context.AssessmentQuestions.Add(mockQ);
                }
            }
            return skillQuestions;
        });

        var results = await Task.WhenAll(tasks);
        foreach (var res in results)
        {
            selectedQuestions.AddRange(res);
        }

        // Insert blank answers to log selected questions
        foreach (var q in selectedQuestions)
        {
            _context.AssessmentAnswers.Add(new AssessmentAnswer
            {
                Id = Guid.NewGuid(),
                AssessmentId = assessment.Id,
                AssessmentQuestionId = q.Id,
                UserId = userId,
                Skill = q.Skill,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetAssessmentDetailAsync(assessment.Id, cancellationToken);
    }

    public async Task<AssessmentDetailDto> GetAssessmentDetailAsync(Guid assessmentId, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        var blankAnswers = await _context.AssessmentAnswers
            .Where(a => a.AssessmentId == assessmentId)
            .ToListAsync(cancellationToken);

        var questionIds = blankAnswers.Select(a => a.AssessmentQuestionId).ToList();

        var questions = await _context.AssessmentQuestions
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync(cancellationToken);

        var questionDtos = questions.Select(q => MapToQuestionDto(q)).ToList();

        return new AssessmentDetailDto
        {
            Id = assessment.Id,
            UserId = assessment.UserId,
            SourceLanguageCode = assessment.SourceLanguageCode,
            TargetLanguageCode = assessment.TargetLanguageCode,
            Status = assessment.Status.ToString(),
            OverallScore = assessment.OverallScore,
            ListeningScore = assessment.ListeningScore,
            SpeakingScore = assessment.SpeakingScore,
            ReadingScore = assessment.ReadingScore,
            WritingScore = assessment.WritingScore,
            ResultLevel = assessment.ResultLevel?.ToString(),
            StartedAt = assessment.StartedAt,
            CompletedAt = assessment.CompletedAt,
            Questions = questionDtos
        };
    }

    public async Task<Dictionary<string, List<AssessmentQuestionDto>>> GetAssessmentQuestionsBySkillAsync(Guid assessmentId, CancellationToken cancellationToken = default)
    {
        var detail = await GetAssessmentDetailAsync(assessmentId, cancellationToken);
        return detail.Questions
            .GroupBy(q => q.Skill)
            .ToDictionary(g => g.Key, g => g.ToList());
    }

    public async Task<SubmitResultDto> SubmitListeningAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        return await GradeObjectiveSectionAsync(assessmentId, userId, SkillType.Listening, request, cancellationToken);
    }

    public async Task<SubmitResultDto> SubmitReadingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        return await GradeObjectiveSectionAsync(assessmentId, userId, SkillType.Reading, request, cancellationToken);
    }

    public async Task<SubmitResultDto> SubmitWritingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        double totalScore = 0;
        int count = 0;
        var feedbacks = new List<string>();

        foreach (var answerItem in request.Answers)
        {
            var question = await _context.AssessmentQuestions.FindAsync(new object[] { answerItem.QuestionId }, cancellationToken);
            if (question == null || question.Skill != SkillType.Writing) continue;

            var dbAnswer = await _context.AssessmentAnswers
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId && a.AssessmentQuestionId == question.Id, cancellationToken);

            if (dbAnswer == null) continue;

            // Grade using AI
            var prompt = question.WritingPrompt ?? question.QuestionText;
            var ansText = answerItem.AnswerText ?? string.Empty;
            var (score, feedback) = await _aiProvider.GradeWritingAsync(prompt, ansText, assessment.SourceLanguageCode, cancellationToken);

            dbAnswer.AnswerText = ansText;
            dbAnswer.Score = score;
            dbAnswer.Feedback = feedback;
            dbAnswer.CreatedAt = DateTime.UtcNow;

            totalScore += score;
            count++;
            feedbacks.Add(feedback);
        }

        double sectionScore = count == 0 ? 0.0 : totalScore / count;
        assessment.WritingScore = sectionScore;

        // Upsert section
        await UpsertSectionAsync(assessmentId, SkillType.Writing, sectionScore, string.Join("; ", feedbacks), cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new SubmitResultDto
        {
            Score = sectionScore,
            Feedback = count == 0 ? "No questions submitted." : "Your writing section has been graded by AI."
        };
    }

    public async Task<SubmitResultDto> SubmitSpeakingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        double totalScore = 0;
        int count = 0;
        var feedbacks = new List<string>();

        foreach (var answerItem in request.Answers)
        {
            var question = await _context.AssessmentQuestions.FindAsync(new object[] { answerItem.QuestionId }, cancellationToken);
            if (question == null || question.Skill != SkillType.Speaking) continue;

            var dbAnswer = await _context.AssessmentAnswers
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId && a.AssessmentQuestionId == question.Id, cancellationToken);

            if (dbAnswer == null) continue;

            // Grade using AI/Speech Provider
            var prompt = question.SpeakingPrompt ?? question.QuestionText;
            var target = answerItem.TargetText ?? question.SpeakingPrompt ?? string.Empty;
            var transcript = answerItem.TranscriptText ?? string.Empty;

            var (score, feedback) = await _aiProvider.GradeSpeakingAsync(prompt, transcript, target, assessment.SourceLanguageCode, cancellationToken);

            dbAnswer.AnswerText = target;
            dbAnswer.TranscriptText = transcript;
            dbAnswer.Score = score;
            dbAnswer.Feedback = feedback;
            dbAnswer.CreatedAt = DateTime.UtcNow;

            totalScore += score;
            count++;
            feedbacks.Add(feedback);
        }

        double sectionScore = count == 0 ? 0.0 : totalScore / count;
        assessment.SpeakingScore = sectionScore;

        // Upsert section
        await UpsertSectionAsync(assessmentId, SkillType.Speaking, sectionScore, string.Join("; ", feedbacks), cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new SubmitResultDto
        {
            Score = sectionScore,
            Feedback = count == 0 ? "No questions submitted." : "Your speaking section has been graded by AI."
        };
    }

    public async Task<AssessmentCompleteResultDto> CompleteAssessmentAsync(Guid assessmentId, Guid userId, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        double listening = assessment.ListeningScore ?? 0;
        double reading = assessment.ReadingScore ?? 0;
        double writing = assessment.WritingScore ?? 0;
        double speaking = assessment.SpeakingScore ?? 0;

        double overallScore = (listening + reading + writing + speaking) / 4.0;
        assessment.OverallScore = overallScore;

        // Determine levels
        CefrLevel GetCefrLevel(double score) => score switch
        {
            >= 85 => CefrLevel.C1,
            >= 70 => CefrLevel.B2,
            >= 50 => CefrLevel.B1,
            >= 30 => CefrLevel.A2,
            _ => CefrLevel.A1
        };

        var resultLevel = GetCefrLevel(overallScore);
        assessment.ResultLevel = resultLevel;
        assessment.Status = AssessmentStatus.Completed;
        assessment.CompletedAt = DateTime.UtcNow;

        var breakdown = new Dictionary<string, double>
        {
            ["Listening"] = listening,
            ["Speaking"] = speaking,
            ["Reading"] = reading,
            ["Writing"] = writing
        };
        assessment.SkillBreakdownJson = JsonSerializer.Serialize(breakdown);

        var weakSkills = new List<string>();
        if (speaking < 70) weakSkills.Add("Speaking");
        if (writing < 70) weakSkills.Add("Writing");
        if (listening < 70) weakSkills.Add("Listening");
        if (reading < 70) weakSkills.Add("Reading");
        assessment.WeakSkillsJson = JsonSerializer.Serialize(weakSkills);

        // Update user
        user.CurrentCefrLevel = resultLevel;
        user.LevelSource = LevelSource.Assessment;
        user.UpdatedAt = DateTime.UtcNow;

        // Award Badge
        var badge = await _context.Badges.FirstOrDefaultAsync(b => b.Code == "DIAGNOSTIC_COMPLETED", cancellationToken);
        if (badge != null)
        {
            var hasBadge = await _context.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badge.Id, cancellationToken);
            if (!hasBadge)
            {
                _context.UserBadges.Add(new UserBadge
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BadgeId = badge.Id,
                    EarnedAt = DateTime.UtcNow
                });
            }
        }

        // Save UserSkillProfile
        var profile = new UserSkillProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OverallLevel = resultLevel,
            ListeningLevel = GetCefrLevel(listening),
            SpeakingLevel = GetCefrLevel(speaking),
            ReadingLevel = GetCefrLevel(reading),
            WritingLevel = GetCefrLevel(writing),
            ListeningScore = listening,
            SpeakingScore = speaking,
            ReadingScore = reading,
            WritingScore = writing,
            Source = LevelSource.Assessment,
            Notes = "Completed standard 4-skill diagnostic test.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.UserSkillProfiles.Add(profile);

        // Award XP
        user.Xp += 150;
        _context.XpTransactions.Add(new XpTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = 150,
            Reason = "Completed diagnostic assessment",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        // Generate personalized learning path
        var learningPath = await CreateLearningPathInternalAsync(user, resultLevel, LevelSource.Assessment, weakSkills, cancellationToken);

        return new AssessmentCompleteResultDto
        {
            OverallScore = overallScore,
            CefrLevel = resultLevel.ToString(),
            SkillBreakdown = breakdown,
            WeakSkills = weakSkills,
            LearningPathId = learningPath.Id
        };
    }

    public async Task<IEnumerable<AssessmentDetailDto>> GetAssessmentHistoryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var history = await _context.Assessments
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync(cancellationToken);

        var list = new List<AssessmentDetailDto>();
        foreach (var a in history)
        {
            list.Add(new AssessmentDetailDto
            {
                Id = a.Id,
                UserId = a.UserId,
                SourceLanguageCode = a.SourceLanguageCode,
                TargetLanguageCode = a.TargetLanguageCode,
                Status = a.Status.ToString(),
                OverallScore = a.OverallScore,
                ListeningScore = a.ListeningScore,
                SpeakingScore = a.SpeakingScore,
                ReadingScore = a.ReadingScore,
                WritingScore = a.WritingScore,
                ResultLevel = a.ResultLevel?.ToString(),
                StartedAt = a.StartedAt,
                CompletedAt = a.CompletedAt
            });
        }
        return list;
    }

    public async Task<AssessmentCompleteResultDto?> GetLatestAssessmentResultAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var latest = await _context.Assessments
            .Where(a => a.UserId == userId && a.Status == AssessmentStatus.Completed)
            .OrderByDescending(a => a.CompletedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latest == null) return null;

        var breakdown = string.IsNullOrEmpty(latest.SkillBreakdownJson)
            ? new Dictionary<string, double>()
            : JsonSerializer.Deserialize<Dictionary<string, double>>(latest.SkillBreakdownJson) ?? new Dictionary<string, double>();

        var weakSkills = string.IsNullOrEmpty(latest.WeakSkillsJson)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(latest.WeakSkillsJson) ?? new List<string>();

        var activePath = await _context.LearningPaths
            .Where(p => p.UserId == userId && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        return new AssessmentCompleteResultDto
        {
            OverallScore = latest.OverallScore ?? 0,
            CefrLevel = latest.ResultLevel?.ToString() ?? "A1",
            SkillBreakdown = breakdown,
            WeakSkills = weakSkills,
            LearningPathId = activePath?.Id ?? Guid.Empty
        };
    }

    private async Task<SubmitResultDto> GradeObjectiveSectionAsync(Guid assessmentId, Guid userId, SkillType skill, SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        int correctCount = 0;
        int totalCount = 0;
        var feedbacks = new List<string>();

        foreach (var answerItem in request.Answers)
        {
            var question = await _context.AssessmentQuestions.FindAsync(new object[] { answerItem.QuestionId }, cancellationToken);
            if (question == null || question.Skill != skill) continue;

            var dbAnswer = await _context.AssessmentAnswers
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId && a.AssessmentQuestionId == question.Id, cancellationToken);

            if (dbAnswer == null) continue;

            // Correct answer validation
            string cleanedCorrect = CleanCorrectAnswer(question.CorrectAnswerJson);
            string cleanedUser = (answerItem.Answer ?? string.Empty).Trim().ToLower();

            bool isCorrect = cleanedUser == cleanedCorrect;
            if (isCorrect) correctCount++;
            totalCount++;

            dbAnswer.AnswerText = answerItem.Answer;
            dbAnswer.Score = isCorrect ? 100.0 : 0.0;
            dbAnswer.Feedback = isCorrect ? "Correct!" : $"Incorrect. Correct answer was {cleanedCorrect.ToUpper()}.";
            dbAnswer.CreatedAt = DateTime.UtcNow;

            feedbacks.Add(dbAnswer.Feedback);
        }

        double sectionScore = totalCount == 0 ? 0.0 : ((double)correctCount / totalCount) * 100.0;

        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment != null)
        {
            if (skill == SkillType.Listening) assessment.ListeningScore = sectionScore;
            else if (skill == SkillType.Reading) assessment.ReadingScore = sectionScore;

            await UpsertSectionAsync(assessmentId, skill, sectionScore, string.Join("; ", feedbacks), cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new SubmitResultDto
        {
            Score = sectionScore,
            Feedback = $"Correct: {correctCount}/{totalCount}. Score: {Math.Round(sectionScore, 1)}%"
        };
    }

    private static string CleanCorrectAnswer(string? json)
    {
        if (string.IsNullOrEmpty(json)) return string.Empty;
        try
        {
            // Try to deserialize if it's a JSON array/string
            var parsed = JsonSerializer.Deserialize<string>(json);
            return (parsed ?? string.Empty).Trim().ToLower();
        }
        catch
        {
            return json.Trim().ToLower();
        }
    }

    private async Task UpsertSectionAsync(Guid assessmentId, SkillType skill, double score, string feedback, CancellationToken cancellationToken)
    {
        var section = await _context.AssessmentSections
            .FirstOrDefaultAsync(s => s.AssessmentId == assessmentId && s.Skill == skill, cancellationToken);

        if (section == null)
        {
            _context.AssessmentSections.Add(new AssessmentSection
            {
                Id = Guid.NewGuid(),
                AssessmentId = assessmentId,
                Skill = skill,
                Score = score,
                MaxScore = 100,
                Feedback = feedback,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            section.Score = score;
            section.Feedback = feedback;
            section.CreatedAt = DateTime.UtcNow;
        }
    }

    private async Task<LearningPath> CreateLearningPathInternalAsync(User user, CefrLevel level, LevelSource source, List<string> weakSkills, CancellationToken cancellationToken)
    {
        // Deactivate old active paths
        var activePaths = await _context.LearningPaths
            .Where(p => p.UserId == user.Id && p.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var oldPath in activePaths)
        {
            oldPath.IsActive = false;
        }

        // Fetch curated lessons matching CEFR Level
        var curatedLessons = await _context.Lessons
            .Where(l => l.CefrLevel == level && l.IsPublished)
            .OrderBy(l => l.OrderIndex)
            .Select(l => l.Title)
            .ToListAsync(cancellationToken);

        if (curatedLessons.Count == 0)
        {
            curatedLessons.Add("Greetings and Introductions");
            curatedLessons.Add("Present Simple Tense");
        }

        string description = $"Roadmap generated automatically from your diagnostic test performance.";
        try
        {
            var aiText = await _aiProvider.GenerateLearningPathAsync(level, user.SourceLanguageCode, weakSkills, cancellationToken);
            var aiData = JsonSerializer.Deserialize<Dictionary<string, object>>(aiText);
            if (aiData != null && aiData.TryGetValue("description", out var descVal))
            {
                description = descVal.ToString() ?? description;
            }
        }
        catch
        {
            // Fallback gracefully
        }

        var path = new LearningPath
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TargetLanguageCode = "en",
            SourceLanguageCode = user.SourceLanguageCode,
            CefrLevel = level,
            Title = $"Roadmap based on Assessment ({level})",
            Description = description,
            RecommendedLessonsJson = JsonSerializer.Serialize(curatedLessons),
            WeakSkillsJson = JsonSerializer.Serialize(weakSkills),
            GeneratedFrom = source,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.LearningPaths.Add(path);
        return path;
    }

    private static AssessmentQuestionDto MapToQuestionDto(AssessmentQuestion q) => new()
    {
        Id = q.Id,
        Skill = q.Skill.ToString(),
        Level = q.Level.ToString(),
        QuestionText = q.QuestionText,
        Instruction = q.Instruction,
        PassageText = q.PassageText,
        AudioUrl = q.AudioUrl,
        AudioTranscript = q.AudioTranscript,
        SpeakingPrompt = q.SpeakingPrompt,
        WritingPrompt = q.WritingPrompt,
        Options = string.IsNullOrEmpty(q.OptionsJson) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>(),
        CorrectAnswer = CleanCorrectAnswer(q.CorrectAnswerJson),
        Explanation = q.Explanation,
        IsAiGenerated = q.IsAiGenerated
    };
}
