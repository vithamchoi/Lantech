using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class Exercise
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public ExerciseType Type { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string? SourceLanguageCode { get; set; }
    public string? TargetText { get; set; }
    public string? OptionsJson { get; set; }
    public string? CorrectAnswerJson { get; set; }
    public string? Explanation { get; set; }
    public int Difficulty { get; set; }
    public int XpReward { get; set; }
    public int OrderIndex { get; set; }
    public bool IsAiGenerated { get; set; }
    public DateTime CreatedAt { get; set; }
}