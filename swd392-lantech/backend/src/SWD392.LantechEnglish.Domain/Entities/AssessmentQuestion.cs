using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class AssessmentQuestion
{
    public Guid Id { get; set; }
    public SkillType Skill { get; set; }
    public CefrLevel Level { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string? PassageText { get; set; }
    public string? AudioUrl { get; set; }
    public string? AudioTranscript { get; set; }
    public string? SpeakingPrompt { get; set; }
    public string? WritingPrompt { get; set; }
    public string? OptionsJson { get; set; }
    public string? CorrectAnswerJson { get; set; }
    public string? Explanation { get; set; }
    public string? SourceLanguageCode { get; set; }
    public bool IsAiGenerated { get; set; }
    public DateTime CreatedAt { get; set; }
}