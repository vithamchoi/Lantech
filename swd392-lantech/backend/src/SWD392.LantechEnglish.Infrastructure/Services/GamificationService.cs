using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Gamification;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class GamificationService : IGamificationService
{
    private readonly AppDbContext _context;

    public GamificationService(AppDbContext context)
    {
        _context = context;
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

