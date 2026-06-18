namespace SWD392.LantechEnglish.Application.DTOs.Pronunciation;

public class PronunciationAttemptDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? ExerciseId { get; set; }
    public string TargetText { get; set; } = null!;
    public string TranscriptText { get; set; } = null!;
    public string? AudioUrl { get; set; }
    public double Score { get; set; }
    public double Accuracy { get; set; }
    public double? Fluency { get; set; }
    public double? Completeness { get; set; }
    public string? Feedback { get; set; }
    public object? WordLevelFeedback { get; set; } // Deserialized array for easy consumption
    public List<string> Suggestions { get; set; } = new();
    public string Provider { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
