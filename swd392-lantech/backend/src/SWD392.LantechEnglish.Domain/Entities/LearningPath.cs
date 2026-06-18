using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class LearningPath
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TargetLanguageCode { get; set; } = string.Empty;
    public string SourceLanguageCode { get; set; } = string.Empty;
    public CefrLevel CefrLevel { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? RecommendedLessonsJson { get; set; }
    public string? WeakSkillsJson { get; set; }
    public LevelSource GeneratedFrom { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}