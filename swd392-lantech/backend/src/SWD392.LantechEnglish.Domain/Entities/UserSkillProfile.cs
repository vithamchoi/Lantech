using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class UserSkillProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public CefrLevel OverallLevel { get; set; }
    public CefrLevel? ListeningLevel { get; set; }
    public CefrLevel? SpeakingLevel { get; set; }
    public CefrLevel? ReadingLevel { get; set; }
    public CefrLevel? WritingLevel { get; set; }
    public double? ListeningScore { get; set; }
    public double? SpeakingScore { get; set; }
    public double? ReadingScore { get; set; }
    public double? WritingScore { get; set; }
    public LevelSource Source { get; set; }
    public string? LearningGoal { get; set; }
    public string? PreferredTopicsJson { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}