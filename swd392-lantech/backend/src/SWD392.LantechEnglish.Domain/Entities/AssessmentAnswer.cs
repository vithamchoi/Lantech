using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class AssessmentAnswer
{
    public Guid Id { get; set; }
    public Guid AssessmentId { get; set; }
    public Guid AssessmentQuestionId { get; set; }
    public Guid UserId { get; set; }
    public SkillType Skill { get; set; }
    public string? AnswerText { get; set; }
    public string? TranscriptText { get; set; }
    public string? AudioUrl { get; set; }
    public double? Score { get; set; }
    public string? Feedback { get; set; }
    public string? AiFeedbackJson { get; set; }
    public DateTime CreatedAt { get; set; }
}