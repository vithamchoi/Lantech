namespace SWD392.LantechEnglish.Application.DTOs.Assessments;

public class AssessmentAnswerItem
{
    public Guid QuestionId { get; set; }
    public string? Answer { get; set; } // MCQ answer (e.g. "A" or option text)
    public string? AnswerText { get; set; } // Writing answer text
    public string? TargetText { get; set; } // Speaking target text
    public string? TranscriptText { get; set; } // Speaking speech transcript
}

public class SubmitAnswersRequest
{
    public List<AssessmentAnswerItem> Answers { get; set; } = new();
}
