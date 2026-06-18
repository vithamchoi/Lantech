namespace SWD392.LantechEnglish.Application.DTOs.Assessments;

public class StartAssessmentRequest
{
    public string SourceLanguageCode { get; set; } = "vi";
    public string Mode { get; set; } = "Mixed"; // QuestionBank, AI, Mixed
    public string? TargetLevel { get; set; }
}
