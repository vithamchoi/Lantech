using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Auth;
using SWD392.LantechEnglish.Application.DTOs.Dashboard;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    private readonly IUserService _userService;
    private readonly ILearningPathService _pathService;

    public DashboardService(AppDbContext context, IUserService userService, ILearningPathService pathService)
    {
        _context = context;
        _userService = userService;
        _pathService = pathService;
    }

    public async Task<DashboardDto> GetDashboardDataAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var userDto = new UserDto
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

        var summary = await _userService.GetStudySummaryAsync(userId, cancellationToken);
        var recommended = await _pathService.GetRecommendedLessonsAsync(userId, cancellationToken);

        // Fetch weaknesses from active path
        var weaknesses = new List<string>();
        var activePath = await _context.LearningPaths
            .Where(p => p.UserId == userId && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (activePath != null && !string.IsNullOrEmpty(activePath.WeakSkillsJson))
        {
            try
            {
                weaknesses = JsonSerializer.Deserialize<List<string>>(activePath.WeakSkillsJson) ?? new List<string>();
            }
            catch
            {
                // Fallback
            }
        }

        return new DashboardDto
        {
            User = userDto,
            Summary = summary,
            Weaknesses = weaknesses,
            RecommendedNextLessons = recommended.Take(2).ToList(),
            DueFlashcardsCount = summary.DueFlashcardsCount
        };
    }
}
