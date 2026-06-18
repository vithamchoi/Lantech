namespace SWD392.LantechEnglish.Application.DTOs.Users;

public class StudySummaryDto
{
    public int TotalXp { get; set; }
    public string? CurrentLevel { get; set; }
    public Dictionary<string, string> SkillLevels { get; set; } = new();
    public int StreakCount { get; set; }
    public int TotalLessonsCompleted { get; set; }
    public int TotalExercisesCompleted { get; set; }
    public int DueFlashcardsCount { get; set; }
}
