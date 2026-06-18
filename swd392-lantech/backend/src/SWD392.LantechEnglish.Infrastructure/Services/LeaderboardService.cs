using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Leaderboard;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly AppDbContext _context;

    public LeaderboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<LeaderboardDto> GetLeaderboardAsync(string period, int top, CancellationToken cancellationToken = default)
    {
        var cleanPeriod = period.Trim().ToLower();

        List<LeaderboardEntryDto> entries;

        if (cleanPeriod is "weekly" or "monthly")
        {
            int days = cleanPeriod == "weekly" ? 7 : 30;
            var threshold = DateTime.UtcNow.AddDays(-days);

            // Group transactions by user and sum amounts
            var groupedTransactions = await _context.XpTransactions
                .Where(t => t.CreatedAt >= threshold)
                .GroupBy(t => t.UserId)
                .Select(g => new { UserId = g.Key, Amount = g.Sum(x => x.Amount) })
                .OrderByDescending(x => x.Amount)
                .Take(top)
                .ToListAsync(cancellationToken);

            var userIds = groupedTransactions.Select(x => x.UserId).ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToListAsync(cancellationToken);

            entries = groupedTransactions.Select((g, idx) =>
            {
                var u = users.FirstOrDefault(user => user.Id == g.UserId);
                return new LeaderboardEntryDto
                {
                    Rank = idx + 1,
                    UserId = g.UserId,
                    FullName = u?.FullName ?? "Unknown User",
                    AvatarUrl = u?.AvatarUrl,
                    Xp = g.Amount,
                    StreakCount = u?.StreakCount ?? 0
                };
            }).ToList();
        }
        else
        {
            // All-Time
            var users = await _context.Users
                .Where(u => u.Status == Domain.Enums.UserStatus.Active)
                .OrderByDescending(u => u.Xp)
                .Take(top)
                .ToListAsync(cancellationToken);

            entries = users.Select((u, idx) => new LeaderboardEntryDto
            {
                Rank = idx + 1,
                UserId = u.Id,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                Xp = u.Xp,
                StreakCount = u.StreakCount
            }).ToList();
        }

        return new LeaderboardDto
        {
            Period = period,
            Entries = entries
        };
    }
}
