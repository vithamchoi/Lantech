namespace SWD392.LantechEnglish.Application.DTOs.Assessments;

public class AssessmentQuestionDto
{
    public Guid Id { get; set; }
    public string Skill { get; set; } = null!;
    public string Level { get; set; } = null!;
    public string QuestionText { get; set; } = null!;
    public string? Instruction { get; set; }
    public string? PassageText { get; set; }
    public string? AudioUrl { get; set; }
    public string? AudioTranscript { get; set; }
    public string? SpeakingPrompt { get; set; }
    public string? WritingPrompt { get; set; }
    public List<string>? Options { get; set; }
    public string? CorrectAnswer { get; set; }
    public string? Explanation { get; set; }
    public bool IsAiGenerated { get; set; }
}
