namespace SWD392.LantechEnglish.Application.Interfaces;

public class PronunciationResult
{
    public double Score { get; set; }
    public double Accuracy { get; set; }
    public double? Fluency { get; set; }
    public double? Completeness { get; set; }
    public string? Feedback { get; set; }
    public string? WordLevelFeedbackJson { get; set; } // Detailed feedback per word
}

public interface ISpeechAssessmentProvider
{
    Task<PronunciationResult> AssessPronunciationAsync(string targetText, string transcriptText, CancellationToken cancellationToken = default);
}
