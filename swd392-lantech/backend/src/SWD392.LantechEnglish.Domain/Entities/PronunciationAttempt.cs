using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class PronunciationAttempt
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? ExerciseId { get; set; }
    public string TargetText { get; set; } = string.Empty;
    public string TranscriptText { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public double Score { get; set; }
    public double Accuracy { get; set; }
    public double? Fluency { get; set; }
    public double? Completeness { get; set; }
    public string? Feedback { get; set; }
    public string? WordLevelFeedbackJson { get; set; }
    public PronunciationProvider Provider { get; set; }
    public DateTime CreatedAt { get; set; }
}