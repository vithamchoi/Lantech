using SWD392.LantechEnglish.Application.DTOs.Leaderboard;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface ILeaderboardService
{
    Task<LeaderboardDto> GetLeaderboardAsync(string period, int top, CancellationToken cancellationToken = default);
}
