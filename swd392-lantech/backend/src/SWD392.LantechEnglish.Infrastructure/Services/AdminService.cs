using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Admin;
using SWD392.LantechEnglish.Application.DTOs.Exercises;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.DTOs.Vocabulary;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _context;

    public AdminService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> GetOverviewStatsAsync(CancellationToken cancellationToken = default)
    {
        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var activeUsers = await _context.Users.CountAsync(u => u.Status == UserStatus.Active, cancellationToken);
        var totalLessons = await _context.Lessons.CountAsync(cancellationToken);
        var totalQuestions = await _context.Exercises.CountAsync(cancellationToken);
        var totalBadges = await _context.Badges.CountAsync(cancellationToken);

        return new AdminStatsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalLessons = totalLessons,
            TotalQuestions = totalQuestions,
            TotalBadges = totalBadges
        };
    }

    // --- USERS ---
    public async Task<IEnumerable<AdminUserDto>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                Username = u.FullName,
                Email = u.Email,
                Joined = u.CreatedAt.ToString("yyyy-MM-dd"),
                Role = u.Role.ToString().ToLower(),
                Status = u.Status.ToString().ToLower(),
                Xp = u.Xp
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> UpdateUserRoleAsync(Guid id, string role, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { id }, cancellationToken);
        if (user == null) return false;

        if (Enum.TryParse<UserRole>(role, true, out var parsedRole))
        {
            user.Role = parsedRole;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        return false;
    }

    public async Task<bool> UpdateUserStatusAsync(Guid id, string status, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { id }, cancellationToken);
        if (user == null) return false;

        if (Enum.TryParse<UserStatus>(status, true, out var parsedStatus))
        {
            user.Status = parsedStatus;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        return false;
    }

    // --- LESSONS CRUD ---

    public async Task<IEnumerable<AdminLessonDto>> GetLessonsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Lessons
            .Select(l => new AdminLessonDto
            {
                Id = l.Id,
                Title = l.Title,
                Level = l.CefrLevel.ToString(),
                Exercises = _context.Exercises.Count(e => e.LessonId == l.Id),
                Students = 0, // Placeholder
                Order = l.OrderIndex
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<LessonDto> CreateLessonAsync(CreateLessonRequest request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CefrLevel>(request.CefrLevel, true, out var level) ||
            !Enum.TryParse<SkillType>(request.Skill, true, out var skill) ||
            !Enum.TryParse<ContentSource>(request.ContentSource, true, out var source))
        {
            throw new ArgumentException("Invalid enum parameters.");
        }

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            CefrLevel = level,
            TargetLanguageCode = "en",
            Title = request.Title,
            Description = request.Description,
            Skill = skill,
            Topic = request.Topic,
            ContentSource = source,
            OrderIndex = request.OrderIndex,
            EstimatedMinutes = request.EstimatedMinutes,
            XpReward = request.XpReward,
            IsPublished = request.IsPublished,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync(cancellationToken);

        return MapLessonToDto(lesson);
    }

    public async Task<LessonDto> UpdateLessonAsync(Guid id, CreateLessonRequest request, CancellationToken cancellationToken = default)
    {
        var lesson = await _context.Lessons.FindAsync(new object[] { id }, cancellationToken);
        if (lesson == null) throw new KeyNotFoundException("Lesson not found");

        if (!Enum.TryParse<CefrLevel>(request.CefrLevel, true, out var level) ||
            !Enum.TryParse<SkillType>(request.Skill, true, out var skill) ||
            !Enum.TryParse<ContentSource>(request.ContentSource, true, out var source))
        {
            throw new ArgumentException("Invalid enum parameters.");
        }

        lesson.CefrLevel = level;
        lesson.Title = request.Title;
        lesson.Description = request.Description;
        lesson.Skill = skill;
        lesson.Topic = request.Topic;
        lesson.ContentSource = source;
        lesson.OrderIndex = request.OrderIndex;
        lesson.EstimatedMinutes = request.EstimatedMinutes;
        lesson.XpReward = request.XpReward;
        lesson.IsPublished = request.IsPublished;
        lesson.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapLessonToDto(lesson);
    }

    public async Task<bool> DeleteLessonAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var lesson = await _context.Lessons.FindAsync(new object[] { id }, cancellationToken);
        if (lesson == null) return false;

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- EXERCISES CRUD ---

    public async Task<IEnumerable<AdminQuestionDto>> GetQuestionsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Exercises
            .Select(e => new AdminQuestionDto
            {
                Id = e.Id,
                Text = e.Prompt,
                Skill = e.Type.ToString(),
                Level = "Unknown", // Can be joined with Lesson.CefrLevel if needed
                Difficulty = e.Difficulty.ToString()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<ExerciseType>(request.Type, true, out var type))
        {
            throw new ArgumentException("Invalid exercise type parameter.");
        }

        var exercise = new Exercise
        {
            Id = Guid.NewGuid(),
            LessonId = request.LessonId,
            Type = type,
            Prompt = request.Prompt,
            Instruction = request.Instruction,
            SourceLanguageCode = request.SourceLanguageCode,
            TargetText = request.TargetText,
            OptionsJson = request.Options != null ? JsonSerializer.Serialize(request.Options) : null,
            CorrectAnswerJson = JsonSerializer.Serialize(request.CorrectAnswer),
            Explanation = request.Explanation,
            Difficulty = request.Difficulty,
            XpReward = request.XpReward,
            OrderIndex = request.OrderIndex,
            IsAiGenerated = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync(cancellationToken);

        return MapExerciseToDto(exercise);
    }

    public async Task<ExerciseDto> UpdateExerciseAsync(Guid id, CreateExerciseRequest request, CancellationToken cancellationToken = default)
    {
        var ex = await _context.Exercises.FindAsync(new object[] { id }, cancellationToken);
        if (ex == null) throw new KeyNotFoundException("Exercise not found");

        if (!Enum.TryParse<ExerciseType>(request.Type, true, out var type))
        {
            throw new ArgumentException("Invalid exercise type parameter.");
        }

        ex.LessonId = request.LessonId;
        ex.Type = type;
        ex.Prompt = request.Prompt;
        ex.Instruction = request.Instruction;
        ex.SourceLanguageCode = request.SourceLanguageCode;
        ex.TargetText = request.TargetText;
        ex.OptionsJson = request.Options != null ? JsonSerializer.Serialize(request.Options) : null;
        ex.CorrectAnswerJson = JsonSerializer.Serialize(request.CorrectAnswer);
        ex.Explanation = request.Explanation;
        ex.Difficulty = request.Difficulty;
        ex.XpReward = request.XpReward;
        ex.OrderIndex = request.OrderIndex;

        await _context.SaveChangesAsync(cancellationToken);
        return MapExerciseToDto(ex);
    }

    public async Task<bool> DeleteExerciseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var ex = await _context.Exercises.FindAsync(new object[] { id }, cancellationToken);
        if (ex == null) return false;

        _context.Exercises.Remove(ex);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- VOCABULARY CRUD ---

    public async Task<IEnumerable<AdminVocabularyDto>> GetVocabulariesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Vocabularies
            .Select(v => new AdminVocabularyDto
            {
                Id = v.Id,
                Word = v.Word,
                Phoneme = v.Ipa ?? "",
                Level = v.CefrLevel.ToString(),
                Definition = _context.VocabularyTranslations
                    .Where(t => t.VocabularyId == v.Id && t.LanguageCode == "vi")
                    .Select(t => t.Meaning)
                    .FirstOrDefault() ?? "",
                Added = v.CreatedAt.ToString("yyyy-MM-dd")
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<VocabularyDto> CreateVocabularyAsync(CreateVocabularyRequest request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CefrLevel>(request.CefrLevel, true, out var level) ||
            !Enum.TryParse<ContentSource>(request.ContentSource, true, out var source))
        {
            throw new ArgumentException("Invalid enum parameters.");
        }

        var vocab = new Vocabulary
        {
            Id = Guid.NewGuid(),
            Word = request.Word,
            Ipa = request.Ipa,
            AudioUrl = request.AudioUrl,
            CefrLevel = level,
            PartOfSpeech = request.PartOfSpeech,
            ExampleSentence = request.ExampleSentence,
            ContentSource = source,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vocabularies.Add(vocab);

        var translations = new List<VocabularyTranslation>();
        foreach (var t in request.Translations)
        {
            var vt = new VocabularyTranslation
            {
                Id = Guid.NewGuid(),
                VocabularyId = vocab.Id,
                LanguageCode = t.LanguageCode,
                Meaning = t.Meaning,
                Explanation = t.Explanation,
                ExampleTranslation = t.ExampleTranslation
            };
            _context.VocabularyTranslations.Add(vt);
            translations.Add(vt);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return MapVocabularyToDto(vocab, translations);
    }

    public async Task<VocabularyDto> UpdateVocabularyAsync(Guid id, CreateVocabularyRequest request, CancellationToken cancellationToken = default)
    {
        var vocab = await _context.Vocabularies.FindAsync(new object[] { id }, cancellationToken);
        if (vocab == null) throw new KeyNotFoundException("Vocabulary not found");

        if (!Enum.TryParse<CefrLevel>(request.CefrLevel, true, out var level) ||
            !Enum.TryParse<ContentSource>(request.ContentSource, true, out var source))
        {
            throw new ArgumentException("Invalid enum parameters.");
        }

        vocab.Word = request.Word;
        vocab.Ipa = request.Ipa;
        vocab.AudioUrl = request.AudioUrl;
        vocab.CefrLevel = level;
        vocab.PartOfSpeech = request.PartOfSpeech;
        vocab.ExampleSentence = request.ExampleSentence;
        vocab.ContentSource = source;

        // Recreate translations
        var oldTranslations = await _context.VocabularyTranslations
            .Where(t => t.VocabularyId == id)
            .ToListAsync(cancellationToken);

        _context.VocabularyTranslations.RemoveRange(oldTranslations);

        var newTranslations = new List<VocabularyTranslation>();
        foreach (var t in request.Translations)
        {
            var vt = new VocabularyTranslation
            {
                Id = Guid.NewGuid(),
                VocabularyId = vocab.Id,
                LanguageCode = t.LanguageCode,
                Meaning = t.Meaning,
                Explanation = t.Explanation,
                ExampleTranslation = t.ExampleTranslation
            };
            _context.VocabularyTranslations.Add(vt);
            newTranslations.Add(vt);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return MapVocabularyToDto(vocab, newTranslations);
    }

    public async Task<bool> DeleteVocabularyAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vocab = await _context.Vocabularies.FindAsync(new object[] { id }, cancellationToken);
        if (vocab == null) return false;

        var translations = await _context.VocabularyTranslations
            .Where(t => t.VocabularyId == id)
            .ToListAsync(cancellationToken);

        _context.VocabularyTranslations.RemoveRange(translations);
        _context.Vocabularies.Remove(vocab);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- BADGES ---
    public async Task<IEnumerable<AdminBadgeDto>> GetBadgesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Badges
            .Select(b => new AdminBadgeDto
            {
                Id = b.Id,
                Title = b.Name,
                Description = b.Description,
                RequiredXP = b.ConditionType == "XP" ? b.ConditionValue : 0,
                Holders = _context.UserBadges.Count(ub => ub.BadgeId == b.Id)
            })
            .ToListAsync(cancellationToken);
    }

    // --- MAP HELPERS ---

    private static LessonDto MapLessonToDto(Lesson l) => new()
    {
        Id = l.Id,
        CefrLevel = l.CefrLevel.ToString(),
        TargetLanguageCode = l.TargetLanguageCode,
        SourceLanguageCode = l.SourceLanguageCode,
        Title = l.Title,
        Description = l.Description,
        Skill = l.Skill.ToString(),
        Topic = l.Topic,
        ContentSource = l.ContentSource.ToString(),
        OrderIndex = l.OrderIndex,
        EstimatedMinutes = l.EstimatedMinutes,
        XpReward = l.XpReward,
        IsPublished = l.IsPublished,
        ProgressStatus = "NotStarted"
    };

    private static ExerciseDto MapExerciseToDto(Exercise e) => new()
    {
        Id = e.Id,
        LessonId = e.LessonId,
        Type = e.Type.ToString(),
        Prompt = e.Prompt,
        Instruction = e.Instruction,
        SourceLanguageCode = e.SourceLanguageCode,
        TargetText = e.TargetText,
        Options = string.IsNullOrEmpty(e.OptionsJson) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(e.OptionsJson) ?? new List<string>(),
        CorrectAnswer = CleanAnswer(e.CorrectAnswerJson),
        Explanation = e.Explanation,
        Difficulty = e.Difficulty,
        XpReward = e.XpReward,
        OrderIndex = e.OrderIndex,
        IsAiGenerated = e.IsAiGenerated
    };

    private static VocabularyDto MapVocabularyToDto(Vocabulary v, IEnumerable<VocabularyTranslation> trans) => new()
    {
        Id = v.Id,
        Word = v.Word,
        Ipa = v.Ipa,
        AudioUrl = v.AudioUrl,
        CefrLevel = v.CefrLevel.ToString(),
        PartOfSpeech = v.PartOfSpeech,
        ExampleSentence = v.ExampleSentence,
        ContentSource = v.ContentSource.ToString(),
        CreatedAt = v.CreatedAt,
        Translations = trans.Select(t => new VocabularyTranslationDto
        {
            Id = t.Id,
            VocabularyId = t.VocabularyId,
            LanguageCode = t.LanguageCode,
            Meaning = t.Meaning,
            Explanation = t.Explanation,
            ExampleTranslation = t.ExampleTranslation
        }).ToList()
    };

    private static string CleanAnswer(string? json)
    {
        if (string.IsNullOrEmpty(json)) return string.Empty;
        try
        {
            var parsed = JsonSerializer.Deserialize<string>(json);
            return (parsed ?? string.Empty).Trim().ToLower();
        }
        catch
        {
            return json.Trim().ToLower();
        }
    }
}
