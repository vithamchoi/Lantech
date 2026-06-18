using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class Assessment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string SourceLanguageCode { get; set; } = string.Empty;
    public string TargetLanguageCode { get; set; } = "en";
    public AssessmentStatus Status { get; set; }
    public double? OverallScore { get; set; }
    public double? ListeningScore { get; set; }
    public double? SpeakingScore { get; set; }
    public double? ReadingScore { get; set; }
    public double? WritingScore { get; set; }
    public CefrLevel? ResultLevel { get; set; }
    public string? SkillBreakdownJson { get; set; }
    public string? WeakSkillsJson { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}