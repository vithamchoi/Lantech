namespace SWD392.LantechEnglish.Application.DTOs.Leaderboard;

public class LeaderboardEntryDto
{
    public int Rank { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public int Xp { get; set; }
    public int StreakCount { get; set; }
}
