namespace SWD392.LantechEnglish.Application.DTOs.Exercises;

public class ExerciseDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string Type { get; set; } = null!;
    public string Prompt { get; set; } = null!;
    public string? Instruction { get; set; }
    public string? SourceLanguageCode { get; set; }
    public string? TargetText { get; set; }
    public List<string>? Options { get; set; }
    public string? CorrectAnswer { get; set; }
    public string? Explanation { get; set; }
    public int Difficulty { get; set; }
    public int XpReward { get; set; }
    public int OrderIndex { get; set; }
    public bool IsAiGenerated { get; set; }
}
