namespace SWD392.LantechEnglish.Application.DTOs.Lessons;

public class LessonDto
{
    public Guid Id { get; set; }
    public string CefrLevel { get; set; } = null!;
    public string TargetLanguageCode { get; set; } = "en";
    public string? SourceLanguageCode { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Skill { get; set; } = null!;
    public string? Topic { get; set; }
    public string ContentSource { get; set; } = null!;
    public int OrderIndex { get; set; }
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public bool IsPublished { get; set; }
    
    // User progress details
    public string ProgressStatus { get; set; } = "NotStarted";
    public double? UserScore { get; set; }
    public DateTime? CompletedAt { get; set; }
}
