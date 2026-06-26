using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Auth;
using SWD392.LantechEnglish.Application.DTOs.Users;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToUserDto(user);
    }

    public async Task<UserDto> UpdateSourceLanguageAsync(Guid userId, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var language = await _context.Languages.FirstOrDefaultAsync(l => l.Code == sourceLanguageCode && l.IsSourceSupported, cancellationToken);
        if (language == null) throw new InvalidOperationException("Source language is not supported");

        user.SourceLanguageCode = sourceLanguageCode;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToUserDto(user);
    }

    public async Task<UserDto> UpdateTargetLevelAsync(Guid userId, string currentCefrLevel, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        if (!Enum.TryParse<CefrLevel>(currentCefrLevel, true, out var level))
        {
            throw new InvalidOperationException("Invalid CEFR level");
        }

        user.CurrentCefrLevel = level;
        user.LevelSource = LevelSource.AdminOverride;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToUserDto(user);
    }

    public async Task<StudySummaryDto> GetStudySummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var skillProfile = await _context.UserSkillProfiles
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var lessonsCompleted = await _context.LessonProgress
            .Where(p => p.UserId == userId && p.Status == ProgressStatus.Completed)
            .Select(p => p.LessonId)
            .Distinct()
            .CountAsync(cancellationToken);

        var exercisesCompleted = await _context.ExerciseAttempts
            .CountAsync(a => a.UserId == userId && a.IsCorrect, cancellationToken);

        var dueFlashcards = await _context.Flashcards
            .CountAsync(f => f.UserId == userId && f.DueDate <= DateTime.UtcNow, cancellationToken);

        var skillLevels = new Dictionary<string, string>();
        if (skillProfile != null)
        {
            skillLevels["Listening"] = skillProfile.ListeningLevel?.ToString() ?? "A1";
            skillLevels["Speaking"] = skillProfile.SpeakingLevel?.ToString() ?? "A1";
            skillLevels["Reading"] = skillProfile.ReadingLevel?.ToString() ?? "A1";
            skillLevels["Writing"] = skillProfile.WritingLevel?.ToString() ?? "A1";
        }
        else
        {
            var baseLevel = user.CurrentCefrLevel?.ToString() ?? "A1";
            skillLevels["Listening"] = baseLevel;
            skillLevels["Speaking"] = baseLevel;
            skillLevels["Reading"] = baseLevel;
            skillLevels["Writing"] = baseLevel;
        }

        return new StudySummaryDto
        {
            TotalXp = user.Xp,
            CurrentLevel = user.CurrentCefrLevel?.ToString() ?? "A1",
            SkillLevels = skillLevels,
            StreakCount = user.StreakCount,
            TotalLessonsCompleted = lessonsCompleted,
            TotalExercisesCompleted = exercisesCompleted,
            DueFlashcardsCount = dueFlashcards
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        return user == null ? null : MapToUserDto(user);
    }

    public async Task<List<StreakCalendarDayDto>> GetStreakCalendarAsync(Guid userId, int offsetMinutes, CancellationToken cancellationToken = default)
    {
        var localNow = DateTime.UtcNow.AddMinutes(-offsetMinutes);
        var startDateLocal = localNow.AddDays(-29).Date;
        var startDateUtc = startDateLocal.AddMinutes(offsetMinutes);

        var lessonDates = await _context.LessonProgress
            .Where(p => p.UserId == userId && p.UpdatedAt >= startDateUtc)
            .Select(p => p.UpdatedAt)
            .ToListAsync(cancellationToken);

        var exerciseDates = await _context.ExerciseAttempts
            .Where(a => a.UserId == userId && a.CreatedAt >= startDateUtc)
            .Select(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var xpDates = await _context.XpTransactions
            .Where(t => t.UserId == userId && t.CreatedAt >= startDateUtc)
            .Select(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        var flashcardDates = await _context.FlashcardReviews
            .Where(r => r.UserId == userId && r.ReviewedAt >= startDateUtc)
            .Select(r => r.ReviewedAt)
            .ToListAsync(cancellationToken);

        var pronunciationDates = await _context.PronunciationAttempts
            .Where(a => a.UserId == userId && a.CreatedAt >= startDateUtc)
            .Select(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var allUtcTimestamps = lessonDates
            .Concat(exerciseDates)
            .Concat(xpDates)
            .Concat(flashcardDates)
            .Concat(pronunciationDates);

        var studiedDates = allUtcTimestamps
            .Select(ts => ts.AddMinutes(-offsetMinutes).Date)
            .ToHashSet();

        var calendar = new List<StreakCalendarDayDto>();
        for (int i = 29; i >= 0; i--)
        {
            var targetDate = startDateLocal.AddDays(29 - i);
            calendar.Add(new StreakCalendarDayDto
            {
                Date = targetDate.ToString("yyyy-MM-dd"),
                Studied = studiedDates.Contains(targetDate)
            });
        }

        return calendar;
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        AvatarUrl = user.AvatarUrl,
        Role = user.Role.ToString(),
        SourceLanguageCode = user.SourceLanguageCode,
        TargetLanguageCode = user.TargetLanguageCode,
        CurrentCefrLevel = user.CurrentCefrLevel?.ToString(),
        Xp = user.Xp,
        StreakCount = user.StreakCount
    };
}
