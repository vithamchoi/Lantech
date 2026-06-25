using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class LessonService : ILessonService
{
    private readonly AppDbContext _context;
    private readonly IGamificationService _gamificationService;

    public LessonService(AppDbContext context, IGamificationService gamificationService)
    {
        _context = context;
        _gamificationService = gamificationService;
    }

    public async Task<IEnumerable<LessonDto>> GetLessonsAsync(string? level, string? skill, int page, int pageSize, Guid userId, CancellationToken cancellationToken = default)
    {
        var query = _context.Lessons
            .Where(l => l.IsPublished);

        if (!string.IsNullOrEmpty(level) && Enum.TryParse<CefrLevel>(level, true, out var cefr))
        {
            query = query.Where(l => l.CefrLevel == cefr);
        }

        if (!string.IsNullOrEmpty(skill) && Enum.TryParse<SkillType>(skill, true, out var sk))
        {
            query = query.Where(l => l.Skill == sk);
        }

        var lessons = await query
            .OrderBy(l => l.CefrLevel)
            .ThenBy(l => l.OrderIndex)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var progressList = await _context.LessonProgress
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        return lessons.Select(l =>
        {
            var p = progressList
                .Where(pr => pr.LessonId == l.Id)
                .OrderByDescending(pr => pr.Status)
                .FirstOrDefault();
            return MapToDto(l, p);
        });
    }

    public async Task<LessonDto?> GetLessonByIdAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken = default)
    {
        var lesson = await _context.Lessons.FindAsync(new object[] { lessonId }, cancellationToken);
        if (lesson == null) return null;

        var progress = await _context.LessonProgress
            .Where(p => p.UserId == userId && p.LessonId == lessonId)
            .OrderByDescending(p => p.Status)
            .FirstOrDefaultAsync(cancellationToken);

        return MapToDto(lesson, progress);
    }

    public async Task<LessonDto> StartLessonAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken = default)
    {
        var lesson = await _context.Lessons.FindAsync(new object[] { lessonId }, cancellationToken);
        if (lesson == null) throw new KeyNotFoundException("Lesson not found");

        var progress = await _context.LessonProgress
            .Where(p => p.UserId == userId && p.LessonId == lessonId)
            .OrderByDescending(p => p.Status)
            .FirstOrDefaultAsync(cancellationToken);

        if (progress == null)
        {
            progress = new LessonProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                LessonId = lessonId,
                Status = ProgressStatus.InProgress,
                Score = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.LessonProgress.Add(progress);
        }
        else if (progress.Status == ProgressStatus.NotStarted)
        {
            progress.Status = ProgressStatus.InProgress;
            progress.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson, progress);
    }

    public async Task<LessonDto> CompleteLessonAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken = default)
    {
        var lesson = await _context.Lessons.FindAsync(new object[] { lessonId }, cancellationToken);
        if (lesson == null) throw new KeyNotFoundException("Lesson not found");

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var progress = await _context.LessonProgress
            .Where(p => p.UserId == userId && p.LessonId == lessonId)
            .OrderByDescending(p => p.Status)
            .FirstOrDefaultAsync(cancellationToken);

        bool firstTimeCompleted = false;

        if (progress == null)
        {
            progress = new LessonProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                LessonId = lessonId,
                Status = ProgressStatus.Completed,
                Score = 100,
                CompletedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.LessonProgress.Add(progress);
            firstTimeCompleted = true;
        }
        else if (progress.Status != ProgressStatus.Completed)
        {
            progress.Status = ProgressStatus.Completed;
            progress.Score = 100;
            progress.CompletedAt = DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;
            firstTimeCompleted = true;
        }

        if (firstTimeCompleted)
        {
            // Award XP
            int reward = lesson.XpReward > 0 ? lesson.XpReward : 20;
            user.Xp += reward;
            _context.XpTransactions.Add(new XpTransaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Amount = reward,
                Reason = $"Completed lesson: {lesson.Title}",
                CreatedAt = DateTime.UtcNow
            });

            // Update Streak
            UpdateUserStreak(user);

            // Award Badges
            await _gamificationService.CheckAndAwardBadgesAsync(userId, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson, progress);
    }

    private static void UpdateUserStreak(User user)
    {
        var today = DateTime.UtcNow.Date;
        if (user.LastStudyDate.HasValue)
        {
            var lastStudy = user.LastStudyDate.Value.Date;
            if (lastStudy == today)
            {
                // Already studied today, streak stays the same
            }
            else if (lastStudy == today.AddDays(-1))
            {
                // Studied yesterday, increment streak
                user.StreakCount += 1;
            }
            else
            {
                // Studied before yesterday, reset streak to 1
                user.StreakCount = 1;
            }
        }
        else
        {
            // First time studying
            user.StreakCount = 1;
        }
        user.LastStudyDate = DateTime.UtcNow;
    }

    private static LessonDto MapToDto(Lesson l, LessonProgress? p) => new()
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
    };
}
