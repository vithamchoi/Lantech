using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.LearningPaths;
using SWD392.LantechEnglish.Application.DTOs.Onboarding;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class OnboardingService : IOnboardingService
{
    private readonly AppDbContext _context;
    private readonly IAIProvider _aiProvider;

    public OnboardingService(AppDbContext context, IAIProvider aiProvider)
    {
        _context = context;
        _aiProvider = aiProvider;
    }

    public Task<OnboardingOptionsDto> GetOnboardingOptionsAsync(CancellationToken cancellationToken = default)
    {
        var options = new OnboardingOptionsDto
        {
            CanTakeAssessment = true,
            CanSelfSelectLevel = true,
            SupportedLevels = new List<string> { "A1", "A2", "B1", "B2", "C1" },
            SupportedSkills = new List<string> { "Listening", "Speaking", "Reading", "Writing" },
            Explanation = "You can take a 4-skill diagnostic English assessment (Listening, Speaking, Reading, Writing) to map your skills to a CEFR level, or self-report your level directly to generate your personalized learning path."
        };
        return Task.FromResult(options);
    }

    public async Task<OnboardingResultDto> SelfSelectLevelAsync(Guid userId, SelfSelectLevelRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        if (!Enum.TryParse<CefrLevel>(request.OverallLevel, true, out var overall) ||
            !Enum.TryParse<CefrLevel>(request.ListeningLevel, true, out var listening) ||
            !Enum.TryParse<CefrLevel>(request.SpeakingLevel, true, out var speaking) ||
            !Enum.TryParse<CefrLevel>(request.ReadingLevel, true, out var reading) ||
            !Enum.TryParse<CefrLevel>(request.WritingLevel, true, out var writing))
        {
            throw new InvalidOperationException("Invalid CEFR Level values provided.");
        }

        // Create UserSkillProfile
        var profile = new UserSkillProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OverallLevel = overall,
            ListeningLevel = listening,
            SpeakingLevel = speaking,
            ReadingLevel = reading,
            WritingLevel = writing,
            Source = LevelSource.SelfReported,
            LearningGoal = request.LearningGoal,
            PreferredTopicsJson = JsonSerializer.Serialize(request.PreferredTopics ?? new List<string>()),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserSkillProfiles.Add(profile);

        // Update User profile
        user.CurrentCefrLevel = overall;
        user.LevelSource = LevelSource.SelfReported;
        user.UpdatedAt = DateTime.UtcNow;

        // Check if user has SELF_LEVEL_SELECTED badge
        var badge = await _context.Badges.FirstOrDefaultAsync(b => b.Code == "SELF_LEVEL_SELECTED", cancellationToken);
        if (badge != null)
        {
            var alreadyHas = await _context.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badge.Id, cancellationToken);
            if (!alreadyHas)
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

        await _context.SaveChangesAsync(cancellationToken);

        // Generate Learning Path
        var learningPath = await CreateLearningPathInternalAsync(user, overall, LevelSource.SelfReported, new List<string>(), cancellationToken);

        return new OnboardingResultDto
        {
            Profile = MapToDto(profile),
            LearningPath = MapToPathDto(learningPath)
        };
    }

    public async Task<UserSkillProfileDto?> GetMyLevelProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await _context.UserSkillProfiles
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return profile == null ? null : MapToDto(profile);
    }

    public async Task<OnboardingResultDto> RegenerateLearningPathAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var profile = await _context.UserSkillProfiles
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (profile == null)
        {
            throw new InvalidOperationException("Please select your level or complete an assessment first.");
        }

        var weakSkills = new List<string>();
        // Detect weak skills based on profile ratings
        if (profile.SpeakingLevel < profile.OverallLevel) weakSkills.Add("Speaking");
        if (profile.WritingLevel < profile.OverallLevel) weakSkills.Add("Writing");
        if (profile.ListeningLevel < profile.OverallLevel) weakSkills.Add("Listening");
        if (profile.ReadingLevel < profile.OverallLevel) weakSkills.Add("Reading");

        var learningPath = await CreateLearningPathInternalAsync(user, profile.OverallLevel, profile.Source, weakSkills, cancellationToken);

        return new OnboardingResultDto
        {
            Profile = MapToDto(profile),
            LearningPath = MapToPathDto(learningPath)
        };
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
            // Seed defaults if empty in db
            curatedLessons.Add("Greetings and Introductions");
            curatedLessons.Add("Present Simple Tense");
        }

        // Generate AI explanation / enrichment layer
        string description = $"Personalized roadmap for {level} level English acquisition.";
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
            Title = $"Roadmap to {level} Mastery",
            Description = description,
            RecommendedLessonsJson = JsonSerializer.Serialize(curatedLessons),
            WeakSkillsJson = JsonSerializer.Serialize(weakSkills),
            GeneratedFrom = source,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.LearningPaths.Add(path);
        await _context.SaveChangesAsync(cancellationToken);

        return path;
    }

    private static UserSkillProfileDto MapToDto(UserSkillProfile p) => new()
    {
        Id = p.Id,
        UserId = p.UserId,
        OverallLevel = p.OverallLevel.ToString(),
        ListeningLevel = p.ListeningLevel?.ToString(),
        SpeakingLevel = p.SpeakingLevel?.ToString(),
        ReadingLevel = p.ReadingLevel?.ToString(),
        WritingLevel = p.WritingLevel?.ToString(),
        ListeningScore = p.ListeningScore,
        SpeakingScore = p.SpeakingScore,
        ReadingScore = p.ReadingScore,
        WritingScore = p.WritingScore,
        Source = p.Source.ToString(),
        LearningGoal = p.LearningGoal,
        PreferredTopics = string.IsNullOrEmpty(p.PreferredTopicsJson) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(p.PreferredTopicsJson) ?? new List<string>(),
        Notes = p.Notes,
        CreatedAt = p.CreatedAt
    };

    private static LearningPathDto MapToPathDto(LearningPath p) => new()
    {
        Id = p.Id,
        UserId = p.UserId,
        TargetLanguageCode = p.TargetLanguageCode,
        SourceLanguageCode = p.SourceLanguageCode,
        CefrLevel = p.CefrLevel.ToString(),
        Title = p.Title,
        Description = p.Description,
        RecommendedLessons = string.IsNullOrEmpty(p.RecommendedLessonsJson)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(p.RecommendedLessonsJson) ?? new List<string>(),
        WeakSkills = string.IsNullOrEmpty(p.WeakSkillsJson)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(p.WeakSkillsJson) ?? new List<string>(),
        GeneratedFrom = p.GeneratedFrom.ToString(),
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
