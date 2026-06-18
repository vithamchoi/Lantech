using SWD392.LantechEnglish.Application.DTOs.Gamification;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IGamificationService
{
    Task<IEnumerable<BadgeDto>> GetBadgesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<UserBadgeDto>> GetUserBadgesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<XpTransactionDto>> GetXpTransactionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<XpTransactionDto> AwardXpAsync(Guid userId, int amount, string description, CancellationToken cancellationToken = default);
}
