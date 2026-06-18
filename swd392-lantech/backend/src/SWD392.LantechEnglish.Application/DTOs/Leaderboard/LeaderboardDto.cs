namespace SWD392.LantechEnglish.Application.DTOs.Leaderboard;

public class LeaderboardDto
{
    public string Period { get; set; } = null!; // Weekly, Monthly, AllTime
    public List<LeaderboardEntryDto> Entries { get; set; } = new();
}
