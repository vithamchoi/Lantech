using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.LearningPaths;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class LearningPathService : ILearningPathService
{
    private readonly AppDbContext _context;
    private readonly IAIProvider _aiProvider;

    public LearningPathService(AppDbContext context, IAIProvider aiProvider)
    {
        _context = context;
        _aiProvider = aiProvider;
    }

    public async Task<LearningPathDto?> GetActiveLearningPathAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var path = await _context.LearningPaths
            .Where(p => p.UserId == userId && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return path == null ? null : MapToDto(path);
    }

    public async Task<LearningPathDto> GenerateLearningPathAsync(Guid userId, CefrLevel level, LevelSource source, List<string> weakSkills, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        // Deactivate old active paths
        var activePaths = await _context.LearningPaths
            .Where(p => p.UserId == userId && p.IsActive)
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
            UserId = userId,
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

        return MapToDto(path);
    }

    public async Task<IEnumerable<LessonDto>> GetRecommendedLessonsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var level = user.CurrentCefrLevel ?? CefrLevel.A1;

        var activePath = await _context.LearningPaths
            .Where(p => p.UserId == userId && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        List<string> titles = new();
        if (activePath != null && !string.IsNullOrEmpty(activePath.RecommendedLessonsJson))
        {
            titles = JsonSerializer.Deserialize<List<string>>(activePath.RecommendedLessonsJson) ?? new List<string>();
        }

        List<Lesson> lessons;
        if (titles.Count > 0)
        {
            lessons = await _context.Lessons
                .Where(l => l.CefrLevel == level && (titles.Contains(l.Title) || l.Title.StartsWith("Chương ")) && l.IsPublished)
                .ToListAsync(cancellationToken);

            // Reorder to match the recommended list sequence, putting the chapters first
            lessons = lessons
                .OrderBy(l => l.Title.StartsWith("Chương ") ? 0 : 1)
                .ThenBy(l => l.Title.StartsWith("Chương ") ? l.OrderIndex : titles.IndexOf(l.Title))
                .ToList();
        }
        else
        {
            lessons = await _context.Lessons
                .Where(l => l.CefrLevel == level && l.IsPublished)
                .OrderBy(l => l.Title.StartsWith("Chương ") ? 0 : 1)
                .ThenBy(l => l.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        var progressList = await _context.LessonProgress
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        var list = new List<LessonDto>();
        foreach (var l in lessons)
        {
            var p = progressList
                .Where(pr => pr.LessonId == l.Id)
                .OrderByDescending(pr => pr.Status)
                .FirstOrDefault();
            list.Add(new LessonDto
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
                ProgressStatus = p?.Status.ToString() ?? "NotStarted",
                UserScore = p?.Score,
                CompletedAt = p?.CompletedAt
            });
        }

        return list;
    }

    private static LearningPathDto MapToDto(LearningPath p) => new()
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
