namespace SWD392.LantechEnglish.Application.DTOs.Assessments;

public class AssessmentDetailDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string SourceLanguageCode { get; set; } = null!;
    public string TargetLanguageCode { get; set; } = "en";
    public string Status { get; set; } = null!;
    public double? OverallScore { get; set; }
    public double? ListeningScore { get; set; }
    public double? SpeakingScore { get; set; }
    public double? ReadingScore { get; set; }
    public double? WritingScore { get; set; }
    public string? ResultLevel { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<AssessmentQuestionDto> Questions { get; set; } = new();
}
