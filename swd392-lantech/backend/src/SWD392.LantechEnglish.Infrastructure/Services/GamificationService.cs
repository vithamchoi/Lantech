using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Gamification;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class GamificationService : IGamificationService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public GamificationService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<IEnumerable<BadgeDto>> GetBadgesAsync(CancellationToken cancellationToken = default)
    {
        var badges = await _context.Badges.ToListAsync(cancellationToken);
        return badges.Select(b => MapToDto(b));
    }

    public async Task<IEnumerable<UserBadgeDto>> GetUserBadgesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var list = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .OrderByDescending(ub => ub.EarnedAt)
            .ToListAsync(cancellationToken);

        var badgeIds = list.Select(ub => ub.BadgeId).ToList();
        var badges = await _context.Badges
            .Where(b => badgeIds.Contains(b.Id))
            .ToListAsync(cancellationToken);

        return list.Select(ub => new UserBadgeDto
        {
            Id = ub.Id,
            UserId = ub.UserId,
            BadgeId = ub.BadgeId,
            EarnedAt = ub.EarnedAt,
            Badge = MapToDto(badges.FirstOrDefault(b => b.Id == ub.BadgeId) ?? new Badge { Name = "Unknown Badge" })
        });
    }

    public async Task<IEnumerable<XpTransactionDto>> GetXpTransactionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var list = await _context.XpTransactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return list.Select(t => new XpTransactionDto
        {
            Id = t.Id,
            UserId = t.UserId,
            Amount = t.Amount,
            Description = t.Reason,
            CreatedAt = t.CreatedAt
        });
    }

    public async Task<XpTransactionDto> AwardXpAsync(Guid userId, int amount, string description, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        user.Xp += amount;
        user.UpdatedAt = DateTime.UtcNow;

        var tx = new XpTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = amount,
            Reason = description,
            CreatedAt = DateTime.UtcNow
        };

        _context.XpTransactions.Add(tx);
        await _context.SaveChangesAsync(cancellationToken);

        return new XpTransactionDto
        {
            Id = tx.Id,
            UserId = tx.UserId,
            Amount = tx.Amount,
            Description = tx.Reason,
            CreatedAt = tx.CreatedAt
        };
    }

    public async Task CheckAndAwardBadgesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) return;

        // Fetch all badges and already earned badges
        var badges = await _context.Badges.ToListAsync(cancellationToken);
        var earnedBadgeIds = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.BadgeId)
            .ToListAsync(cancellationToken);

        // Fetch stats needed to evaluate the rules
        int xp = user.Xp;
        int streak = user.StreakCount;
        
        int completedLessons = await _context.LessonProgress
            .Where(lp => lp.UserId == userId && lp.Status == ProgressStatus.Completed)
            .Select(lp => lp.LessonId)
            .Distinct()
            .CountAsync(cancellationToken);

        int flashcardReviews = await _context.FlashcardReviews
            .CountAsync(fr => fr.UserId == userId, cancellationToken);

        // Dynamically compute perfect lessons: lessons where all exercises are answered correctly
        var userCorrectAttempts = await _context.ExerciseAttempts
            .Where(ea => ea.UserId == userId && ea.IsCorrect)
            .Join(_context.Exercises,
                ea => ea.ExerciseId,
                e => e.Id,
                (ea, e) => new { e.LessonId, ea.ExerciseId })
            .Distinct()
            .ToListAsync(cancellationToken);

        var userCorrectAttemptCounts = userCorrectAttempts
            .GroupBy(x => x.LessonId)
            .Select(g => new { LessonId = g.Key, CorrectCount = g.Count() })
            .ToList();

        int perfectLessons = 0;
        foreach (var attempt in userCorrectAttemptCounts)
        {
            var totalExercises = await _context.Exercises.CountAsync(e => e.LessonId == attempt.LessonId, cancellationToken);
            if (totalExercises > 0 && attempt.CorrectCount == totalExercises)
            {
                perfectLessons++;
            }
        }

        int assessmentsCompleted = await _context.Assessments
            .CountAsync(a => a.UserId == userId && a.Status == AssessmentStatus.Completed, cancellationToken);

        bool selfLevelSelected = await _context.UserSkillProfiles
            .AnyAsync(p => p.UserId == userId && p.Source == LevelSource.SelfReported, cancellationToken);

        var newEarnedBadges = new List<UserBadge>();

        foreach (var badge in badges)
        {
            if (earnedBadgeIds.Contains(badge.Id)) continue;

            bool isEligible = false;
            string conditionType = badge.ConditionType?.Trim().ToUpper() ?? "";

            switch (conditionType)
            {
                case "XP":
                    isEligible = xp >= badge.ConditionValue;
                    break;
                case "STREAK":
                    isEligible = streak >= badge.ConditionValue;
                    break;
                case "LESSONCOMPLETED":
                    isEligible = completedLessons >= badge.ConditionValue;
                    break;
                case "FLASHCARDREVIEWED":
                    isEligible = flashcardReviews >= badge.ConditionValue;
                    break;
                case "PERFECTLESSON":
                    isEligible = perfectLessons >= badge.ConditionValue;
                    break;
                case "ASSESSMENTCOMPLETED":
                    isEligible = assessmentsCompleted >= badge.ConditionValue;
                    break;
                case "SELFLEVELSELECTED":
                    isEligible = selfLevelSelected;
                    break;
            }

            if (isEligible)
            {
                newEarnedBadges.Add(new UserBadge
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BadgeId = badge.Id,
                    EarnedAt = DateTime.UtcNow
                });
            }
        }

        if (newEarnedBadges.Any())
        {
            _context.UserBadges.AddRange(newEarnedBadges);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var userBadge in newEarnedBadges)
            {
                var badge = badges.First(b => b.Id == userBadge.BadgeId);
                try
                {
                    await _notificationService.CreateNotificationAsync(
                        userId,
                        "Đã mở khóa thành tích mới! 🏆",
                        $"Bạn nhận được huy hiệu \"{badge.Name}\" cho: {badge.Description}.",
                        "Trophy",
                        "#f59e0b",
                        "#fef9c3",
                        cancellationToken
                    );
                }
                catch
                {
                    // Fail-safe: do not fail badge award if notification fails
                }
            }
        }
    }

    private static BadgeDto MapToDto(Badge b) => new()
    {
        Id = b.Id,
        Code = b.Code,
        Name = b.Name,
        Description = b.Description,
        IconUrl = b.IconUrl,
        XpBonus = 0
    };
}

