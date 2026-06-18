using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class Lesson
{
    public Guid Id { get; set; }
    public CefrLevel CefrLevel { get; set; }
    public string TargetLanguageCode { get; set; } = string.Empty;
    public string? SourceLanguageCode { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SkillType Skill { get; set; }
    public string? Topic { get; set; }
    public ContentSource ContentSource { get; set; }
    public int OrderIndex { get; set; }
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}