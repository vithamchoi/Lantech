namespace SWD392.LantechEnglish.Application.DTOs.Onboarding;

public class UserSkillProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string OverallLevel { get; set; } = null!;
    public string? ListeningLevel { get; set; }
    public string? SpeakingLevel { get; set; }
    public string? ReadingLevel { get; set; }
    public string? WritingLevel { get; set; }
    public double? ListeningScore { get; set; }
    public double? SpeakingScore { get; set; }
    public double? ReadingScore { get; set; }
    public double? WritingScore { get; set; }
    public string Source { get; set; } = null!;
    public string? LearningGoal { get; set; }
    public List<string> PreferredTopics { get; set; } = new();
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
